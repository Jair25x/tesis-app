package com.tesis.gateway_service.security.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import javax.crypto.SecretKey;

/**
 * Filtro de Gateway para la validación de JWT en peticiones entrantes.
 * Inyecta los headers necesarios (x-user-id, X-Auth-Username, X-Auth-Roles)
 * a los microservicios downstream.
 */
@Component
public class JwtGatewayFilter implements GatewayFilter, Ordered {

  private static final Logger logger = LoggerFactory.getLogger(JwtGatewayFilter.class);

  private final String jwtSecret;
  private final SecretKey cachedSigningKey;

  public JwtGatewayFilter(@Value("${jwt.secret-key}") String jwtSecret) {
    this.jwtSecret = jwtSecret;
    if (this.jwtSecret == null || this.jwtSecret.isEmpty()) {
      logger.error("JWT_SECRET no está configurada. El filtro JWT no funcionará correctamente.");
      throw new IllegalArgumentException("JWT_SECRET no puede ser nula o vacía.");
    }

    try {
      this.cachedSigningKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(this.jwtSecret));
      logger.info("JwtGatewayFilter inicializado correctamente.");
    } catch (Exception e) {
      logger.error("Error al decodificar la clave secreta JWT: {}", e.getMessage());
      throw new RuntimeException("Error al inicializar el filtro JWT", e);
    }
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    ServerHttpRequest request = exchange.getRequest();
    ServerHttpResponse response = exchange.getResponse();

    // Rutas abiertas
    List<String> openApiEndpoints = List.of(
        "/api/auth/login", "/api/auth/register");
    if (openApiEndpoints.contains(request.getURI().getPath())) {
      return chain.filter(exchange);
    }

    String authHeader = request.getHeaders().getFirst("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    }
    

    String token = authHeader.substring(7);
    try {
      Claims claims = Jwts.parser()
          .verifyWith(this.cachedSigningKey)
          .build()
          .parseSignedClaims(token)
          .getPayload();

      // 1) Tomar userId preferentemente desde claim "userId" como String (UUID).
      String userIdStr = claims.get("userId", String.class);

      // 2) Si no lo trae, intentar con subject si es un UUID.
      if (userIdStr == null || userIdStr.isBlank()) {
        String sub = claims.getSubject();
        if (sub != null && !sub.isBlank()) {
          userIdStr = sub; // si tu subject es UUID, esto funcionará
        }
      }

      if (userIdStr == null || userIdStr.isBlank()) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
      }

      @SuppressWarnings("unchecked")
      List<String> rawRoles = claims.get("roles", List.class);
      if (rawRoles == null)
        rawRoles = List.of();

      // 3) Normalizar con ROLE_*
      List<String> roles = rawRoles.stream()
          .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase())
          .toList();

      // 4) Mutar request con cabeceras internas
      ServerHttpRequest mutated = request.mutate()
          .header("X-Internal-Call", "gateway")
          .header("X-Auth-Username", userIdStr) // <- ¡IMPORTANTE! que sea el UUID
          .header("X-Auth-Roles", String.join(",", roles))
          .header("x-user-id", userIdStr) // opcional, por compatibilidad
          .build();

      return chain.filter(exchange.mutate().request(mutated).build());

    } catch (io.jsonwebtoken.security.SignatureException ex) {
      logger.warn("Firma JWT inválida: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    } catch (io.jsonwebtoken.MalformedJwtException ex) {
      logger.warn("JWT mal formado: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    } catch (io.jsonwebtoken.ExpiredJwtException ex) {
      logger.warn("JWT expirado: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    } catch (io.jsonwebtoken.UnsupportedJwtException ex) {
      logger.warn("JWT no soportado: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    } catch (IllegalArgumentException ex) {
      logger.warn("Claims JWT vacíos o nulos: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    } catch (Exception ex) {
      logger.error("Error inesperado al procesar JWT", ex);
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    }
  }

  @Override
  public int getOrder() {
    return -1;
  }
}
