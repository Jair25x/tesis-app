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
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
  private final ObjectMapper objectMapper;
  private final JwtAuthenticationFilter jwtAuthFilter;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        // 1) CORS y CSRF
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())

        // 2) Stateless
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        // 3) Reglas de autorización
        .authorizeHttpRequests(auth -> auth

            // 3.1) Documentación y Actuator
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers("/actuator/**").permitAll()

            // 3.2) GETs públicos (sin prefijo /api, porque el Gateway hace stripPrefix(1))
            .requestMatchers(HttpMethod.GET, "/curricula/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/curricula/*/competencies/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/competencies/*/standards/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/standards/*/learning-objectives/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/learning-objectives/*/exercises/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/exercises/*/solution-steps/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/exercises/*/hints/**").permitAll()

            // 3.3) Curricula CRUD
            .requestMatchers(HttpMethod.POST, "/curricula").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/curricula/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/curricula/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PATCH, "/curricula/**/reactivate").hasRole("ADMIN")

            // 3.4) Competencies CRUD (anidado en curricula)
            .requestMatchers(HttpMethod.POST, "/curricula/*/competencies").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/curricula/*/competencies/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/curricula/*/competencies/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PATCH, "/curricula/*/competencies/**/reactivate")
            .hasAnyRole("ADMIN", "TEACHER")

            // 3.5) Standards CRUD (anidado en competencies)
            .requestMatchers(HttpMethod.POST, "/competencies/*/standards").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/competencies/*/standards/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/competencies/*/standards/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PATCH, "/competencies/*/standards/**/reactivate")
            .hasAnyRole("ADMIN", "TEACHER")

            // 3.6) LearningObjectives CRUD (anidado en standards)
            .requestMatchers(HttpMethod.POST, "/standards/*/learning-objectives").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/standards/*/learning-objectives/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/standards/*/learning-objectives/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PATCH, "/standards/*/learning-objectives/**/reactivate")
            .hasAnyRole("ADMIN", "TEACHER")

            // 3.7) Exercises CRUD (anidado en learning-objectives)
            .requestMatchers(HttpMethod.POST, "/learning-objectives/*/exercises").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/learning-objectives/*/exercises/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/learning-objectives/*/exercises/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PATCH, "/learning-objectives/*/exercises/**/reactivate")
            .hasAnyRole("ADMIN", "TEACHER")

            // 3.8) SolutionSteps CRUD (anidado en exercises)
            .requestMatchers(HttpMethod.POST, "/exercises/*/solution-steps").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/exercises/*/solution-steps/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/exercises/*/solution-steps/**").hasAnyRole("ADMIN", "TEACHER")

            // 3.9) Hints CRUD (anidado en exercises)
            .requestMatchers(HttpMethod.POST, "/exercises/*/hints").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/exercises/*/hints/**").hasAnyRole("ADMIN", "TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/exercises/*/hints/**").hasAnyRole("ADMIN", "TEACHER")

            // 3.10) el resto, autenticado
            .anyRequest().authenticated())

        // 4) Manejadores de error
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((req, res, authEx) -> {
              logger.error("Unauthorized: {}", authEx.getMessage());
              res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
              res.setContentType("application/json");
              ErrorResponse err = new ErrorResponse(
                  "No autorizado: se requiere autenticación.",
                  HttpStatus.UNAUTHORIZED.value(),
                  System.currentTimeMillis());
              res.getWriter().write(objectMapper.writeValueAsString(err));
            })
            .accessDeniedHandler((req, res, denyEx) -> {
              logger.error("Forbidden: {}", denyEx.getMessage());
              res.setStatus(HttpServletResponse.SC_FORBIDDEN);
              res.setContentType("application/json");
              ErrorResponse err = new ErrorResponse(
                  "Acceso denegado: no tiene permisos.",
                  HttpStatus.FORBIDDEN.value(),
                  System.currentTimeMillis());
              res.getWriter().write(objectMapper.writeValueAsString(err));
            }));

    // 5) Inyectamos nuestro filtro JWT
    http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
