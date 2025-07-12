package com.tesis.gateway_service.config;

import com.tesis.gateway_service.security.filter.JwtGatewayFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de rutas para el API Gateway.
 */
@Configuration
public class GatewayConfig {

    private final JwtGatewayFilter jwtFilter;
    private final RouteLocatorBuilder builder;

    public GatewayConfig(JwtGatewayFilter jwtFilter, RouteLocatorBuilder builder) {
        this.jwtFilter = jwtFilter;
        this.builder = builder;
    }

    @Bean
    public RouteLocator customRouteLocator() {
        return builder.routes()

                // Auth Service
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .stripPrefix(1) // quita "/api" ➔ el servicio recibe "/auth/..."
                                .filter(jwtFilter))
                        .uri("lb://AUTH-SERVICE"))

                // Curriculum Service
                .route("curricula-service", r -> r
                        .path("/api/curricula/**")
                        .filters(f -> f
                                .stripPrefix(1) // quita "/api" ➔ el servicio recibe "/curricula/..."
                                .filter(jwtFilter)
                                .addRequestHeader("X-Internal-Call", "gateway"))
                        .uri("lb://CURRICULUM-SERVICE"))

                // ... añade más rutas aquí siguiendo el mismo patrón

                .build();
    }
}
