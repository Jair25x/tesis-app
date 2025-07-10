package com.tesis.curriculum_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException; // Necesario para el catch de Expiración
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Necesario para el catch de SignatureException
import io.jsonwebtoken.MalformedJwtException; // Necesario para el catch de MalformedJwtException
import io.jsonwebtoken.UnsupportedJwtException; // Necesario para el catch de UnsupportedJwtException
import io.jsonwebtoken.JwtParser; // Importar JwtParser

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.Key; // No directamente necesario si se usa Keys.hmacShaKeyFor directamente, pero útil para claridad
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filtro de autenticación JWT.
 * Intercepta las solicitudes HTTP para validar la autenticación.
 * Puede procesar cabeceras JWT estándar (Authorization: Bearer) o cabeceras
 * personalizadas (X-Auth-Username, X-Auth-Roles) para llamadas internas de
 * Gateway.
 */
@Profile("!test")
@Component
@NoArgsConstructor // Lombok genera constructor sin argumentos, necesario para que Spring lo pueda
                   // inyectar como Bean
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  // Se inyecta la clave secreta desde las propiedades de la aplicación
  @Value("${jwt.secret-key}")
  private String secretKey;

  // Ya no es necesario este método auxiliar si usamos verifyWith directamente
  // con Decoders.BASE64.decode(secretKey)
  /*
   * private Key getSignInKey() {
   * byte[] keyBytes = Decoders.BASE64.decode(secretKey);
   * return Keys.hmacShaKeyFor(keyBytes);
   * }
   */

  @Override
  protected void doFilterInternal(HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    logger.debug("Processing request for URL: {}", request.getRequestURI());

    // 1. Intentar autenticar por cabeceras X-Auth-* (patrón de Gateway)
    String xAuthUsername = request.getHeader("X-Auth-Username");
    String xAuthRoles = request.getHeader("X-Auth-Roles");
    String xInternalCall = request.getHeader("X-Internal-Call"); // Cabecera para identificar llamadas del Gateway

    logger.debug("X-Auth-Username: {}", xAuthUsername);
    logger.debug("X-Auth-Roles: {}", xAuthRoles);
    logger.debug("X-Internal-Call: {}", xInternalCall);

    // Si la cabecera X-Internal-Call está presente y es "gateway", confiamos en
    // X-Auth-* para la autenticación de llamadas internas.
    if (xInternalCall != null && xInternalCall.equals("gateway") && xAuthUsername != null && !xAuthUsername.isEmpty()
        && xAuthRoles != null && !xAuthRoles.isEmpty()) {
      try {
        // Parsear los roles de la cadena y convertirlos a SimpleGrantedAuthority
        List<SimpleGrantedAuthority> authorities = Arrays.stream(xAuthRoles.split(","))
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()))
            .collect(Collectors.toList());

        // Crear el objeto de autenticación y establecerlo en el SecurityContextHolder
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(xAuthUsername,
            null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        logger.debug("SecurityContextHolder populated for trusted internal call for user: {} with roles: {}",
            xAuthUsername, xAuthRoles);

      } catch (Exception e) {
        logger.error("Error processing X-Auth headers from internal call: {}", e.getMessage());
        SecurityContextHolder.clearContext(); // Limpiar el contexto en caso de error
      }
    }
    // 2. Si no es una llamada interna de Gateway, intentar autenticar por JWT
    // estándar
    else {
      String authHeader = request.getHeader("Authorization");
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        logger.debug("No Authorization Bearer token found or it's not a Bearer token. Skipping JWT authentication.");
      } else {
        String jwt = authHeader.substring(7); // Extraer el token JWT (después de "Bearer ")
        try {
          // ✅ MODIFICACIÓN CLAVE: Usar la sintaxis de JJWT 0.12.x que ya te funciona
          // Decodificar la clave secreta de Base64 a bytes para usar con
          // Keys.hmacShaKeyFor
          JwtParser parser = Jwts.parser()
              .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)))
              .build();

          // Parsear el token y obtener los claims
          Claims claims = parser
              .parseSignedClaims(jwt) // Usa parseSignedClaims en lugar de parseClaimsJws
              .getPayload();

          String username = claims.getSubject(); // Obtener el nombre de usuario del claim "sub"
          // Asegúrate de que tu JWT realmente incluye los roles bajo la clave "roles" y
          // como una lista de strings
          List<String> roles = (List<String>) claims.get("roles", List.class);

          if (username != null && roles != null && !roles.isEmpty()) {
            // Construir las autoridades de Spring Security a partir de los roles del JWT
            List<SimpleGrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()))
                .collect(Collectors.toList());

            // Crear el objeto de autenticación y establecerlo en el SecurityContextHolder
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, null,
                authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.debug("SecurityContextHolder populated for JWT authenticated user: {} with roles: {}", username,
                roles);
          } else {
            logger.warn("JWT token is valid but username or roles are missing or empty in claims.");
            SecurityContextHolder.clearContext(); // No se puede autenticar sin datos esenciales
          }
        } catch (SignatureException ex) {
          logger.warn("Invalid JWT signature: {}", ex.getMessage());
          SecurityContextHolder.clearContext();
        } catch (MalformedJwtException ex) {
          logger.warn("Malformed JWT: {}", ex.getMessage());
          SecurityContextHolder.clearContext();
        } catch (ExpiredJwtException ex) {
          logger.warn("Expired JWT: {}", ex.getMessage());
          SecurityContextHolder.clearContext();
        } catch (UnsupportedJwtException ex) {
          logger.warn("Unsupported JWT: {}", ex.getMessage());
          SecurityContextHolder.clearContext();
        } catch (IllegalArgumentException ex) {
          logger.warn("JWT claims are empty or null: {}", ex.getMessage());
          SecurityContextHolder.clearContext();
        } catch (Exception ex) {
          logger.error("Unexpected error processing JWT: {}", ex.getMessage(), ex);
          SecurityContextHolder.clearContext();
        }
      }
    }

    // Continuar con la cadena de filtros de Spring Security
    filterChain.doFilter(request, response);
  }
}
