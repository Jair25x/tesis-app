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

    // Rutas públicas que no requieren autenticación
    List<String> openApiEndpoints = List.of(
        "/api/auth/login", "/api/auth/register", "/api/auth/refresh-token",
        "/api/auth/roles", "/api/auth/logout");

    if (openApiEndpoints.contains(request.getURI().getPath())) {
      logger.debug("Ruta abierta sin autenticación: {}", request.getURI().getPath());
      return chain.filter(exchange);
    }

    String authHeader = request.getHeaders().getFirst("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      logger.warn("Falta cabecera Authorization o formato incorrecto.");
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

      String username = claims.getSubject();
      List<String> roles = claims.get("roles", List.class);
      // Agregar userId si fue incluido en el JWT (debe estar como Number o Integer)
      Number userId = claims.get("userId", Number.class);

      if (userId == null) {
        logger.warn("El JWT no contiene el claim userId. No se puede enrutar correctamente.");
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
      }

      // Enriquecer la petición con los headers necesarios
      ServerHttpRequest modifiedRequest = request.mutate()
          .header("x-user-id", String.valueOf(userId.longValue())) // NUEVO HEADER NECESARIO PARA CURRICULUM-SERVICE
          .header("X-Auth-Username", username)
          .header("X-Auth-Roles", String.join(",", roles))
          .build();

      logger.info("JWT válido para '{}'. ID: {} Roles: {}", username, userId, roles);
      return chain.filter(exchange.mutate().request(modifiedRequest).build());

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
      logger.error("Error inesperado al procesar JWT: {}", ex.getMessage(), ex);
      response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return response.setComplete();
  }

  @Override
  public int getOrder() {
    return -1;
  }
}
