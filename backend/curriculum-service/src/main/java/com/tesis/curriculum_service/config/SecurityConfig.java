package com.tesis.curriculum_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuración principal de Spring Security para el microservicio
 * curriculum-service.
 * - Habilita la seguridad web y a nivel de método con @PreAuthorize.
 * - Configura el filtro JWT para procesar las cabeceras de autenticación.
 * - Deshabilita CSRF y la gestión de sesiones con estado (stateless API).
 * - Proporciona manejadores de errores personalizados para autenticación (401)
 * y autorización (403).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
  private final ObjectMapper objectMapper;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
      throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }

  @Bean
  public JwtAuthenticationFilter jwtAuthenticationFilter() { // ✅ Ahora público
    return new JwtAuthenticationFilter();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Rutas de Swagger/OpenAPI - Siempre públicas y sin autenticación
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

            // GET /api/curriculum (getAllCurricula) - Público, no requiere autenticación
            .requestMatchers(HttpMethod.GET, "/api/curriculum").permitAll()

            // POST /api/curriculum (createCurriculum) - Solo ADMIN
            .requestMatchers(HttpMethod.POST, "/api/curriculum").hasRole("ADMIN")

            // GET /api/curriculum/{id} (getCurriculumById) - Requiere autenticación
            .requestMatchers(HttpMethod.GET, "/api/curriculum/{id}").authenticated()

            // GET /api/curriculum/grade/** (getCurriculaByGrade) - Requiere autenticación
            .requestMatchers(HttpMethod.GET, "/api/curriculum/grade/**").authenticated()

            // GET /api/curriculum/stats (getCurriculumStats) - Solo ADMIN o TEACHER
            .requestMatchers(HttpMethod.GET, "/api/curriculum/stats").hasAnyRole("ADMIN", "TEACHER")

            // PUT /api/curriculum/{id} (updateCurriculum) - Solo ADMIN
            .requestMatchers(HttpMethod.PUT, "/api/curriculum/{id}").hasRole("ADMIN")

            // DELETE /api/curriculum/{id} (deleteCurriculum) - Solo ADMIN
            .requestMatchers(HttpMethod.DELETE, "/api/curriculum/{id}").hasRole("ADMIN")

            // Para cualquier otra petición no cubierta explícitamente, requiere
            // autenticación
            .anyRequest().authenticated())
        .exceptionHandling(exceptions -> exceptions
            .authenticationEntryPoint((request, response, authException) -> {
              logger.error("Unauthorized error: {}", authException.getMessage());
              response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
              response.setContentType("application/json");
              ErrorResponse errorResponse = new ErrorResponse(
                  "No autorizado: Se requiere autenticación.",
                  HttpStatus.UNAUTHORIZED.value(),
                  System.currentTimeMillis());
              response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            })
            .accessDeniedHandler((request, response, accessDeniedException) -> {
              logger.error("Access Denied: {}", accessDeniedException.getMessage());
              response.setStatus(HttpServletResponse.SC_FORBIDDEN);
              response.setContentType("application/json");
              ErrorResponse errorResponse = new ErrorResponse(
                  "Acceso denegado: No tiene los permisos necesarios.",
                  HttpStatus.FORBIDDEN.value(),
                  System.currentTimeMillis());
              response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            }));

    http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
