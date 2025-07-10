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
import org.springframework.beans.factory.annotation.Value; // Importa Value
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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.SecretKey; // Importa SecretKey

/**
 * Filtro de Gateway para la validación de JWT en peticiones entrantes.
 * Este filtro intercepta las solicitudes, extrae el token JWT, lo valida
 * y, si es válido, inyecta la información del usuario (username, roles)
 * en las cabeceras de la petición para que los microservicios downstream
 * puedan utilizarla.
 *
 * NOTA IMPORTANTE: Para un entorno de producción, la clave secreta JWT
 * DEBE ser obtenida de forma segura, como a través de un servicio de
 * configuración
 * centralizado (ej. Spring Cloud Config Server o HashiCorp Vault)
 * o variables de entorno, y NO hardcodeada en el código.
 */
@Component
public class JwtGatewayFilter implements GatewayFilter, Ordered {

  private static final Logger logger = LoggerFactory.getLogger(JwtGatewayFilter.class);

  // ✅ MODIFICACIÓN CLAVE: Inyectamos la clave secreta desde las propiedades de
  // Spring
  // Esta propiedad vendrá del Config Server (gateway-service.yml)
  private final String jwtSecret;
  private SecretKey cachedSigningKey; // Almacenamos la clave decodificada para eficiencia

  /**
   * Constructor del filtro. Inyecta la clave secreta JWT.
   * 
   * @param jwtSecret La clave secreta JWT cargada desde las propiedades.
   */
  public JwtGatewayFilter(@Value("${jwt.secret-key}") String jwtSecret) {
    this.jwtSecret = jwtSecret;
    if (this.jwtSecret == null || this.jwtSecret.isEmpty()) {
      logger.error("JWT_SECRET no está configurada. El filtro JWT no funcionará correctamente.");
      throw new IllegalArgumentException(
          "JWT_SECRET no puede ser nula o vacía. Asegúrate de que esté configurada en Config Server.");
    }
    try {
      this.cachedSigningKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(this.jwtSecret));
      logger.info("JwtGatewayFilter inicializado. Clave secreta cargada y decodificada.");
    } catch (Exception e) {
      logger.error("Error al decodificar la clave secreta JWT: {}", e.getMessage());
      throw new RuntimeException("Error al inicializar el filtro JWT", e);
    }
  }

  /**
   * Lógica principal del filtro.
   * Intercepta la petición, valida el token y modifica la cabecera.
   *
   * @param exchange El intercambio web actual (petición/respuesta).
   * @param chain    La cadena de filtros.
   * @return Un Mono<Void> que indica la finalización del procesamiento del
   *         filtro.
   */
  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    ServerHttpRequest request = exchange.getRequest();
    ServerHttpResponse response = exchange.getResponse();

    // Rutas que no requieren autenticación (ej. login, register, refresh-token,
    // roles)
    List<String> openApiEndpoints = List.of("/api/auth/login", "/api/auth/register", "/api/auth/refresh-token",
        "/api/auth/roles", "/api/auth/logout");

    // Si la ruta está en la lista blanca de endpoints que no requieren
    // autenticación
    if (openApiEndpoints.contains(request.getURI().getPath())) {
      logger.debug("Ruta abierta, no se requiere JWT: {}", request.getURI().getPath());
      return chain.filter(exchange); // Continúa la cadena sin validar JWT
    }

    // Obtiene la cabecera de autorización
    String authHeader = request.getHeaders().getFirst("Authorization");

    // Si no hay cabecera de autorización o no es un token Bearer, devuelve 401
    // Unauthorized
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      logger.warn("Petición sin cabecera de autorización válida o no es Bearer. Ruta: {}", request.getURI().getPath());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
      return response.setComplete(); // Completa la respuesta con 401
    }

    String token = authHeader.substring(7); // Extrae el token JWT (después de "Bearer ")

    try {
      // Parsea y valida el token JWT usando la clave decodificada
      Claims claims = Jwts.parser()
          .verifyWith(this.cachedSigningKey) // Usa la clave SecretKey pre-calculada
          .build()
          .parseSignedClaims(token)
          .getPayload();

      // Extrae la información del usuario de los claims
      String username = claims.getSubject();
      List<String> roles = claims.get("roles", List.class); // Asegúrate de que los roles se incluyan en el JWT

      // Agrega la información del usuario a las cabeceras de la petición
      // Estos headers pueden ser leídos por los microservicios downstream
      ServerHttpRequest modifiedRequest = request.mutate()
          .header("X-Auth-Username", username)
          .header("X-Auth-Roles", String.join(",", roles)) // Une los roles en un string separado por comas
          .build();

      logger.info("JWT validado para usuario: {} (Roles: {}). Continuando con la petición.", username, roles);
      return chain.filter(exchange.mutate().request(modifiedRequest).build()); // Continúa la cadena con la petición
                                                                               // modificada

    } catch (SignatureException ex) {
      logger.warn("Firma JWT inválida: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
    } catch (MalformedJwtException ex) {
      logger.warn("JWT mal formado: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
    } catch (ExpiredJwtException ex) {
      logger.warn("JWT expirado: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
    } catch (UnsupportedJwtException ex) {
      logger.warn("JWT no soportado: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
    } catch (IllegalArgumentException ex) {
      logger.warn("Claims JWT vacíos o nulos: {}", ex.getMessage());
      response.setStatusCode(HttpStatus.UNAUTHORIZED);
    } catch (Exception ex) {
      logger.error("Error inesperado al procesar JWT: {}", ex.getMessage(), ex);
      response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return response.setComplete();
  }

  /**
   * Define el orden de ejecución del filtro.
   * Cuanto menor el valor, mayor la prioridad. Este filtro debería ejecutarse
   * antes que otros filtros de enrutamiento o lógica de negocio.
   *
   * @return El orden del filtro.
   */
  @Override
  public int getOrder() {
    return -1; // Alta prioridad, se ejecuta temprano en la cadena de filtros del Gateway
  }
}
