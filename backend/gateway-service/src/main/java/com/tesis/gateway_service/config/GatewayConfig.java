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

        public GatewayConfig(JwtGatewayFilter jwtFilter) {
                this.jwtFilter = jwtFilter;
        }

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()

                                // Ruta para el servicio Eureka Server (generalmente no necesita JWT filter)
                                .route("eureka-server", r -> r
                                                .path("/eureka/**")
                                                .uri("lb://EUREKA-SERVER"))

                                // Ruta para el servicio Admin Monitoring (generalmente no necesita JWT filter)
                                .route("admin-monitoring-service", r -> r
                                                .path("/admin/**")
                                                .uri("lb://ADMIN-MONITORING-SERVICE"))

                                // Ruta para el servicio Config Server (generalmente no necesita JWT filter)
                                .route("config-service", r -> r
                                                .path("/config/**")
                                                .uri("lb://CONFIG-SERVICE"))

                                // Auth Service
                                // Si el frontend envía /api/auth/login y el Auth-Service espera
                                // /api/auth/login,
                                // el Gateway debe reenviar la ruta tal cual.
                                .route("auth-service", r -> r
                                                .path("/api/auth/**") // Coincide con la ruta que envía el frontend (con
                                                                      // /api)
                                                .filters(f -> f
                                                                // No se necesita stripPrefix ni rewritePath si la URL
                                                                // del frontend
                                                                // ya coincide con la que espera el microservicio.
                                                                .filter(jwtFilter)) // Aplica el filtro JWT (maneja
                                                                                    // rutas abiertas)
                                                .uri("lb://AUTH-SERVICE"))

                                // Curriculum Service
                                // Asumimos que el frontend envía /api/curricula/... y el servicio espera
                                // /api/curricula/...
                                // Por lo tanto, el Gateway debe reenviar la ruta tal cual.
                                .route("curricula-service", r -> r
                                                .path("/api/curricula/**") // Coincide con la ruta que envía el frontend
                                                                           // (con /api)
                                                .filters(f -> f
                                                                // Se eliminó stripPrefix(1) en la versión anterior, lo
                                                                // cual es correcto si el servicio espera /api
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")) // Buen
                                                                                                                 // filtro
                                                                                                                 // para
                                                                                                                 // llamadas
                                                                                                                 // internas
                                                .uri("lb://CURRICULUM-SERVICE"))

                                // ... añade más rutas aquí siguiendo el mismo patrón

                                .build();
        }
}
