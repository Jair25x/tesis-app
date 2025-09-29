// src/main/java/com/tesis/gateway_service/security/SecurityConfig.java
package com.tesis.gateway_service.security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    @Profile("dev")
    SecurityWebFilterChain devChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(ex -> ex
                        .pathMatchers("/internal/**", "/_debug/**").denyAll()
                        .pathMatchers("/actuator/**").permitAll()
                        .anyExchange().permitAll() // tu JwtGatewayFilter gestiona auth de rutas
                )
                .build();
    }

    @Bean
    @Profile("prod")
    SecurityWebFilterChain prodChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(ex -> ex
                        .pathMatchers("/internal/**", "/_debug/**").denyAll()
                        .pathMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .pathMatchers("/actuator/**").denyAll()
                        .anyExchange().permitAll() // sigues delegando en JwtGatewayFilter
                )
                .build();
    }
}
