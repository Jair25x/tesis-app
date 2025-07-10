// src/main/java/com/tesis/gateway_service/config/SecurityConfig.java
// (O el paquete que estés usando, como com.tesis.gateway_service.security)
package com.tesis.gateway_service.security; // Ajusta este paquete si tu archivo está en 'security'

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

// Ya no se necesitan estas importaciones relacionadas con CORS aquí
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.reactive.CorsConfigurationSource;
// import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
// import java.util.Arrays;
// import java.util.List;

/**
 * Configuración de seguridad para el Gateway Service.
 * Utiliza Spring WebFlux Security para proteger las rutas.
 * La configuración de CORS se maneja globalmente en 'application.yml'.
 */
@Configuration
@EnableWebFluxSecurity // Habilita la seguridad web para aplicaciones Spring WebFlux
public class SecurityConfig {

    /**
     * Define la cadena de filtros de seguridad para el Gateway.
     * Configura la deshabilitación de CSRF.
     *
     * @param http Objeto ServerHttpSecurity para configurar la seguridad HTTP.
     * @return Una instancia de SecurityWebFilterChain.
     */
    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable);

        return http.build();
    }

}