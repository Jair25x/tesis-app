package com.tesis.progress_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.progress_service.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.*;
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

import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthFilter;
  private final ObjectMapper mapper;
  private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
    return cfg.getAuthenticationManager();
  }

  /* -------- DEV: Swagger y Actuator abiertos -------- */
  @Bean
  @Profile("dev")
  SecurityFilterChain devFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            .requestMatchers("/actuator/**").permitAll()
            .anyRequest().authenticated())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((req, res, e) -> write401(res, e.getMessage()))
            .accessDeniedHandler((req, res, e) -> write403(res, e.getMessage())));
    http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  /* -------- PROD: sin Swagger; Actuator solo health/info -------- */
  @Bean
  @Profile("prod")
  SecurityFilterChain prodFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").denyAll()
            .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
            .requestMatchers("/actuator/**").denyAll()
            .anyRequest().authenticated())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint((req, res, e) -> write401(res, e.getMessage()))
            .accessDeniedHandler((req, res, e) -> write403(res, e.getMessage())));
    http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  private void write401(jakarta.servlet.http.HttpServletResponse res, String msg) throws java.io.IOException {
    log.error("401 – {}", msg);
    res.setStatus(HttpStatus.UNAUTHORIZED.value());
    res.setContentType("application/json;charset=UTF-8");
    mapper.writeValue(res.getWriter(), Map.of(
        "error", "No autorizado",
        "status", 401,
        "message", msg,
        "timestamp", System.currentTimeMillis()));
  }

  private void write403(jakarta.servlet.http.HttpServletResponse res, String msg) throws java.io.IOException {
    log.error("403 – {}", msg);
    res.setStatus(HttpStatus.FORBIDDEN.value());
    res.setContentType("application/json;charset=UTF-8");
    mapper.writeValue(res.getWriter(), Map.of(
        "error", "Acceso denegado",
        "status", 403,
        "message", msg,
        "timestamp", System.currentTimeMillis()));
  }
}
