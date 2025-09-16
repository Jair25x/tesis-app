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
    if (jwtSecret == null || jwtSecret.isEmpty()) {
      logger.error("JWT_SECRET no está configurada. El filtro JWT no funcionará correctamente.");
      throw new IllegalArgumentException("JWT_SECRET no puede ser nula o vacía.");
    }
    try {
      this.cachedSigningKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
      logger.info("JwtGatewayFilter inicializado correctamente.");
    } catch (Exception e) {
      logger.error("Error al decodificar la clave secreta JWT: {}", e.getMessage());
      throw new RuntimeException("Error al inicializar el filtro JWT", e);
    }
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    // Sanea headers internos nunca confiables desde el cliente
    ServerHttpRequest sanitizedReq = exchange.getRequest().mutate()
        .headers(h -> {
          h.remove("X-Internal-Call");
          h.remove("X-Auth-Username");
          h.remove("X-Auth-Roles");
          h.remove("x-user-id");
        })
        .build();
    ServerWebExchange sanitizedEx = exchange.mutate().request(sanitizedReq).build();

    ServerHttpRequest request = sanitizedEx.getRequest();
    ServerHttpResponse response = sanitizedEx.getResponse();
    String path = request.getURI().getPath();

    // 0) CORS preflight: dejar pasar siempre
    if (request.getMethod() == HttpMethod.OPTIONS) {
      return chain.filter(sanitizedEx);
    }

    // 1) Endpoints públicos de Auth (prefijo)
    if (path.startsWith("/api/auth/")) {
      return chain.filter(sanitizedEx);
    }

    // 2) Validar Authorization
    String authHeader = request.getHeaders().getFirst("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete();
    }

    String token = authHeader.substring(7).trim();
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
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
      }

      // roles robustos (acepta CSV o lista)
      Object rolesObj = claims.get("roles");
      List<String> roles;
      if (rolesObj instanceof String s) {
        roles = Arrays.stream(s.split(",")).map(String::trim).filter(r -> !r.isEmpty()).toList();
      } else if (rolesObj instanceof Collection<?> c) {
        roles = c.stream().map(String::valueOf).toList();
      } else if (rolesObj == null) {
        roles = List.of();
      } else {
        roles = List.of(String.valueOf(rolesObj));
      }

      // Normalizar con ROLE_*
      roles = roles.stream().map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase()).toList();

      // Mutar request con cabeceras internas hacia downstream
      ServerHttpRequest mutated = request.mutate()
          .header("X-Internal-Call", "gateway")
          .header("X-Auth-Username", userIdStr)
          .header("X-Auth-Roles", String.join(",", roles))
          .header("x-user-id", userIdStr)
          .build();

      return chain.filter(sanitizedEx.mutate().request(mutated).build());

    } catch (SignatureException ex) {
      logger.warn("Firma JWT inválida: {}", ex.getMessage());
    } catch (MalformedJwtException ex) {
      logger.warn("JWT mal formado: {}", ex.getMessage());
    } catch (ExpiredJwtException ex) {
      logger.warn("JWT expirado: {}", ex.getMessage());
    } catch (UnsupportedJwtException ex) {
      logger.warn("JWT no soportado: {}", ex.getMessage());
    } catch (IllegalArgumentException ex) {
      logger.warn("Claims JWT vacíos o nulos: {}", ex.getMessage());
    } catch (Exception ex) {
      logger.error("Error inesperado al procesar JWT", ex);
    }
    response.setStatusCode(HttpStatus.UNAUTHORIZED);
    return response.setComplete();
  }

  @Override
  public int getOrder() {
    return -1;
  }
}
