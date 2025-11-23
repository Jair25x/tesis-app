package com.tesis.gateway_service.security.filter;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.util.*;

@Component
public class JwtGatewayFilter implements GatewayFilter, Ordered {

  private static final Logger logger = LoggerFactory.getLogger(JwtGatewayFilter.class);
  private final SecretKey cachedSigningKey;

  public JwtGatewayFilter(@Value("${jwt.secret-key}") String jwtSecret) {
    if (jwtSecret == null || jwtSecret.isBlank()) {
      logger.error("jwt.secret-key no está configurada. El filtro JWT no funcionará correctamente.");
      throw new IllegalArgumentException("jwt.secret-key no puede ser nula o vacía.");
    }
    try {
      // ✅ Igual que en otros servicios: tratamos la clave como Base64
      this.cachedSigningKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret.trim()));
      logger.info("JwtGatewayFilter inicializado correctamente.");
    } catch (Exception e) {
      logger.error("Error al decodificar la clave secreta JWT: {}", e.getMessage());
      throw new RuntimeException("Error al inicializar el filtro JWT", e);
    }
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    // 0) Sanea headers internos nunca confiables desde el cliente
    ServerHttpRequest sanitizedReq = exchange.getRequest().mutate()
        .headers(h -> {
          h.remove("X-Internal-Call");
          h.remove("X-Auth-Username");
          h.remove("X-Auth-Roles");
          h.remove("x-user-id");
          h.remove("x-user-name");
          h.remove("x-user-username");
          h.remove("x-duel-code");
        })
        .build();

    ServerWebExchange sanitizedEx = exchange.mutate().request(sanitizedReq).build();

    ServerHttpRequest request = sanitizedEx.getRequest();
    ServerHttpResponse response = sanitizedEx.getResponse();
    String path = request.getURI().getPath();

    // ¿Es el WS de duels? (acepto sin / y con / al final)
    boolean isDuelsWs = path.equals("/api/duels/ws") || path.startsWith("/api/duels/ws/");

    // 1) CORS preflight: dejar pasar siempre
    if (request.getMethod() == HttpMethod.OPTIONS) {
      return chain.filter(sanitizedEx);
    }

    // 2) Endpoints públicos típicos (Auth, Swagger, Actuator si quieres)
    if (path.startsWith("/api/auth/")
        || path.startsWith("/swagger-ui/")
        || path.startsWith("/v3/api-docs")
        || path.startsWith("/actuator/health")) {
      return chain.filter(sanitizedEx);
    }

    // 3) Resolver token: Authorization o ?token=
    String token = resolveToken(request);

    if (token == null || token.isBlank()) {
      if (isDuelsWs) {
        // ⚠️ Para el WS no devolvemos 401 aquí; dejamos que duels-service responda
        // "unauthorized"
        logger.debug("WS /api/duels/ws sin token. Delega auth a duels-service.");
        return chain.filter(sanitizedEx);
      }
      logger.debug("Solicitud sin token JWT path={}", path);
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    }

    try {
      Claims claims = Jwts.parser()
          .verifyWith(this.cachedSigningKey)
          .build()
          .parseSignedClaims(token)
          .getPayload();

      // userId robusto (acepta Integer/Long/UUID/String) + fallback a subject
      Object userIdObj = claims.get("userId");
      String userIdStr = (userIdObj != null) ? String.valueOf(userIdObj) : claims.getSubject();
      if (userIdStr == null || userIdStr.isBlank()) {
        logger.warn("JWT sin userId/subject path={}", path);
        if (isDuelsWs) {
          // Dejar pasar, y que el WS responda unauthorized
          return chain.filter(sanitizedEx);
        }
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
      }

      // username (para UX; no crítico)
      String username = claims.get("username", String.class);
      if (username == null || username.isBlank()) {
        username = userIdStr;
      }

      // roles robustos (acepta CSV o lista)
      Object rolesObj = claims.get("roles");
      List<String> roles;
      if (rolesObj instanceof String s) {
        roles = Arrays.stream(s.split(","))
            .map(String::trim)
            .filter(r -> !r.isEmpty())
            .toList();
      } else if (rolesObj instanceof Collection<?> c) {
        roles = c.stream().map(String::valueOf).toList();
      } else if (rolesObj == null) {
        roles = List.of();
      } else {
        roles = List.of(String.valueOf(rolesObj));
      }

      // Normalizar con ROLE_*
      roles = roles.stream()
          .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase())
          .toList();

      // 4) Mutar request con cabeceras internas hacia downstream
      ServerHttpRequest mutated = request.mutate()
          .header("X-Internal-Call", "gateway")
          .header("X-Auth-Username", username)
          .header("X-Auth-Roles", String.join(",", roles))
          // 👇 Estas son las que lee duels-service
          .header("x-user-id", userIdStr)
          .header("x-user-username", username)
          .build();

      // Para el WS de duels, además enviamos el short code en un header
      if (isDuelsWs) {
        String code = request.getQueryParams().getFirst("code");
        if (code != null && !code.isBlank()) {
          mutated = mutated.mutate()
              .header("x-duel-code", code)
              .build();
        }
        logger.debug("WS /api/duels/ws con usuario={} username={} code={}", userIdStr, username,
            request.getQueryParams().getFirst("code"));
      }

      return chain.filter(sanitizedEx.mutate().request(mutated).build());

    } catch (SignatureException ex) {
      logger.warn("Firma JWT inválida: {}", ex.getMessage());
      if (isDuelsWs) {
        return chain.filter(sanitizedEx);
      }
    } catch (MalformedJwtException ex) {
      logger.warn("JWT mal formado: {}", ex.getMessage());
      if (isDuelsWs) {
        return chain.filter(sanitizedEx);
      }
    } catch (ExpiredJwtException ex) {
      logger.warn("JWT expirado: {}", ex.getMessage());
      if (isDuelsWs) {
        return chain.filter(sanitizedEx);
      }
    } catch (UnsupportedJwtException ex) {
      logger.warn("JWT no soportado: {}", ex.getMessage());
      if (isDuelsWs) {
        return chain.filter(sanitizedEx);
      }
    } catch (IllegalArgumentException ex) {
      logger.warn("Claims JWT vacíos o nulos: {}", ex.getMessage());
      if (isDuelsWs) {
        return chain.filter(sanitizedEx);
      }
    } catch (Exception ex) {
      logger.error("Error inesperado al procesar JWT", ex);
      if (isDuelsWs) {
        return chain.filter(sanitizedEx);
      }
    }

    // Para HTTP normal: 401 si hubo problemas con el JWT
    response.setStatusCode(HttpStatus.UNAUTHORIZED);
    return response.setComplete();
  }

  private String resolveToken(ServerHttpRequest request) {
    // 1) Authorization: Bearer ...
    String authHeader = request.getHeaders().getFirst("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }

    // 2) Fallback: query param ?token= (útil para WebSocket)
    String tokenParam = request.getQueryParams().getFirst("token");
    if (tokenParam != null && !tokenParam.isBlank()) {
      return tokenParam.trim();
    }

    return null;
  }

  @Override
  public int getOrder() {
    // Se ejecuta temprano, pero después de filtros de CORS si los tienes
    return -1;
  }
}
