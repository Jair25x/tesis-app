// auth-service: src/main/java/com/tesis/auth_service/config/SecurityConfig.java
package com.tesis.auth_service.config;

import com.tesis.auth_service.security.jwt.AuthEntryPointJwt;
import com.tesis.auth_service.security.jwt.AuthTokenFilter;
import com.tesis.auth_service.security.jwt.JwtTokenProvider;
import com.tesis.auth_service.security.jwt.S2SJwtFilter;
import com.tesis.auth_service.service.UserDetailsServiceImpl;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.*;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
@EnableMethodSecurity
public class SecurityConfig {

  private final UserDetailsServiceImpl userDetailsService;
  private final AuthEntryPointJwt unauthorizedHandler;
  private final JwtTokenProvider jwtTokenProvider;

  // Endpoints "públicos" del auth (usuario humano)
  private static final String[] PUBLIC_AUTH_ENDPOINTS = {
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh-token",
      "/api/auth/logout",
      "/api/auth/roles"
  };

  public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                        AuthEntryPointJwt unauthorizedHandler,
                        JwtTokenProvider jwtTokenProvider) {
    this.userDetailsService = userDetailsService;
    this.unauthorizedHandler = unauthorizedHandler;
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @Bean
  public AuthTokenFilter authenticationJwtTokenFilter() {
    return new AuthTokenFilter(jwtTokenProvider, userDetailsService);
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder());
    return provider;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
    return cfg.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  /* ===================== ACTUATOR CHAIN (prioridad alta) ===================== */
  @Bean
  @Order(0)
  public SecurityFilterChain actuatorChain(HttpSecurity http) throws Exception {
    // Hace match solo con /actuator/** (cualquier endpoint Actuator)
    http
        .securityMatcher(EndpointRequest.toAnyEndpoint())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
        .authorizeHttpRequests(auth -> auth
            // Lo que realmente quedará expuesto lo controlaremos con application-*.yml
            // Pero aquí permitimos que el chain "actuator" no bloquee por JWT.
            .anyRequest().permitAll()
        );
    // Importante: este chain NO agrega filtros S2S ni JWT de usuario.
    return http.build();
  }

  /* ===================== DEV CHAIN ===================== */
  @Bean
  @Profile("dev")
  @Order(1)
  public SecurityFilterChain devChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
        .authorizeHttpRequests(auth -> auth
            // swagger abierto en dev
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            // (health/info ya entran al chain actuator; si no, igual permitimos)
            .requestMatchers("/actuator/**").permitAll()
            // públicos de auth
            .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
            .anyRequest().authenticated()
        );

    http.authenticationProvider(authenticationProvider());

    // Filtros: S2S primero, luego JWT humano
    http.addFilterBefore(new S2SJwtFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  /* ===================== PROD CHAIN ===================== */
  @Bean
  @Profile("prod")
  @Order(1)
  public SecurityFilterChain prodChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
        .authorizeHttpRequests(auth -> auth
            // swagger cerrado en prod
            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").denyAll()
            // actuator lo maneja el chain de @Order(0), aquí por si algo cae, negamos por defecto
            .requestMatchers("/actuator/**").denyAll()
            // públicos de auth
            .requestMatchers(PUBLIC_AUTH_ENDPOINTS).permitAll()
            .anyRequest().authenticated()
        );

    http.authenticationProvider(authenticationProvider());

    // Filtros: S2S primero, luego JWT humano
    http.addFilterBefore(new S2SJwtFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
