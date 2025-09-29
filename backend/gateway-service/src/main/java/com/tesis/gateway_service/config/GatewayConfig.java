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

                                // ==============================
                                // Infra
                                // ==============================
                                .route("eureka-server", r -> r
                                                .path("/eureka/**")
                                                .uri("lb://EUREKA-SERVER"))
                                .route("admin-monitoring-service", r -> r
                                                .path("/admin/**")
                                                .uri("lb://ADMIN-MONITORING-SERVICE"))
                                .route("config-service", r -> r
                                                .path("/config/**")
                                                .uri("lb://CONFIG-SERVICE"))

                                // ==============================
                                // Auth
                                // ==============================
                                .route("auth-service", r -> r
                                                .path("/api/auth/**")
                                                .filters(f -> f.filter(jwtFilter)) // el filtro libera /api/auth/**
                                                .uri("lb://AUTH-SERVICE"))

                                // ==============================
                                // Curriculum / Progress / Classrooms / Assessments / Advisor
                                // ==============================
                                .route("curriculum-service", r -> r
                                                .path("/api/curricula/**")
                                                .filters(f -> f
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway"))
                                                .uri("lb://CURRICULUM-SERVICE"))
                                .route("progress-service", r -> r
                                                .path("/api/progress/**")
                                                .filters(f -> f
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway"))
                                                .uri("lb://PROGRESS-SERVICE"))
                                .route("classroom-service", r -> r
                                                .path("/api/classrooms/**")
                                                .filters(f -> f
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway"))
                                                .uri("lb://CLASSROOM-SERVICE"))
                                .route("assessment-service", r -> r
                                                .path("/api/assessments/**")
                                                .filters(f -> f
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway"))
                                                .uri("lb://ASSESSMENT-SERVICE"))
                                .route("ai-advisor-service", r -> r
                                                .path("/api/ai/**")
                                                .filters(f -> f
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway"))
                                                .uri("lb://AI-ADVISOR-SERVICE"))

                                // ==============================
                                // DUELS — WS (antes que la HTTP)
                                // - sin jwtFilter (el duels-service valida ?token=)
                                // - rewrite /api/duels/ws -> /ws
                                // ==============================
                                .route("duels-service-ws", r -> r
                                                .path("/api/duels/ws")
                                                .filters(f -> f
                                                                .rewritePath("/api/duels/ws", "/ws")
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .removeRequestHeader("Cookie")
                                                                .removeRequestHeader("Set-Cookie"))
                                                .uri("lb:ws://DUELS-SERVICE"))

                                // ==============================
                                // DUELS — HTTP
                                // ==============================
                                .route("duels-service-http", r -> r
                                                .path("/api/duels/**")
                                                .filters(f -> f
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .removeRequestHeader("Cookie")
                                                                .removeRequestHeader("Set-Cookie"))
                                                .uri("lb://DUELS-SERVICE"))

                                .build();
        }
}
