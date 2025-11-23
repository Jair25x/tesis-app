package com.tesis.gateway_service.config;

import com.tesis.gateway_service.security.filter.JwtGatewayFilter;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Configuration
public class GatewayConfig {

        /** Limiter “general”: 20 req/s con burst 50 */
        @Bean
        @Primary
        public RedisRateLimiter standardLimiter() {
                return new RedisRateLimiter(20, 50);
        }

        /** Limiter para duels HTTP: 30 req/s con burst 60 */
        @Bean
        public RedisRateLimiter duelsLimiter() {
                return new RedisRateLimiter(30, 60);
        }

        @Bean
        public RouteLocator customRouteLocator(
                        RouteLocatorBuilder b,
                        JwtGatewayFilter jwtFilter,
                        UserOrIpKeyResolver userOrIpKeyResolver,
                        RedisRateLimiter standardLimiter,
                        RedisRateLimiter duelsLimiter) {
                return b.routes()

                                // Bloqueo duro /internal/** y /_debug/**
                                .route("block-internal", r -> r
                                                .path("/internal/**", "/_debug/**")
                                                .filters(f -> f.setStatus(403))
                                                .uri("no://op"))

                                // Infra
                                .route("eureka-server", r -> r
                                                .path("/eureka/**")
                                                .filters(f -> f.filter(this::attachRequestId))
                                                .uri("lb://EUREKA-SERVER"))
                                .route("admin-monitoring-service", r -> r
                                                .path("/admin/**")
                                                .filters(f -> f.filter(this::attachRequestId))
                                                .uri("lb://ADMIN-MONITORING-SERVICE"))
                                .route("config-service", r -> r
                                                .path("/config/**")
                                                .filters(f -> f.filter(this::attachRequestId))
                                                .uri("lb://CONFIG-SERVICE"))

                                // Auth (público)
                                .route("auth-service", r -> r
                                                .path("/api/auth/**")
                                                .filters(f -> f.filter(this::attachRequestId))
                                                .uri("lb://AUTH-SERVICE"))

                                // ======================
                                // Servicios HTTP con RL
                                // ======================
                                .route("curriculum-service", r -> r
                                                .path("/api/curricula/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .requestRateLimiter(rl -> rl
                                                                                .setKeyResolver(userOrIpKeyResolver)
                                                                                .setRateLimiter(standardLimiter))
                                                                // CB opcional (ejemplo), puedes quitarlo si no quieres
                                                                // aquí
                                                                .circuitBreaker(c -> c
                                                                                .setName("curriculum-cb")
                                                                                .setFallbackUri("forward:/__fallback")))
                                                .uri("lb://CURRICULUM-SERVICE"))
                                .route("progress-service", r -> r
                                                .path("/api/progress/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .requestRateLimiter(rl -> rl
                                                                                .setKeyResolver(userOrIpKeyResolver)
                                                                                .setRateLimiter(standardLimiter)))
                                                .uri("lb://PROGRESS-SERVICE"))
                                .route("classroom-service", r -> r
                                                .path("/api/classrooms/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .requestRateLimiter(rl -> rl
                                                                                .setKeyResolver(userOrIpKeyResolver)
                                                                                .setRateLimiter(standardLimiter)))
                                                .uri("lb://CLASSROOM-SERVICE"))
                                .route("assessment-service", r -> r
                                                .path("/api/assessments/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .requestRateLimiter(rl -> rl
                                                                                .setKeyResolver(userOrIpKeyResolver)
                                                                                .setRateLimiter(standardLimiter)))
                                                .uri("lb://ASSESSMENT-SERVICE"))
                                .route("ai-advisor-service", r -> r
                                                .path("/api/ai/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .requestRateLimiter(rl -> rl
                                                                                .setKeyResolver(userOrIpKeyResolver)
                                                                                .setRateLimiter(standardLimiter))
                                                                // 🔽 Añade estos (opcionales pero recomendados para
                                                                // SSE):
                                                                .setResponseHeader("X-Accel-Buffering", "no")
                                                                .setResponseHeader("Cache-Control", "no-store")
                                                                .dedupeResponseHeader("Connection", "RETAIN_UNIQUE"))
                                                .uri("lb://AI-ADVISOR-SERVICE"))

                                // DUELS — WS (regex case-insensitive para "websocket")
                                .route("duels-service-ws", r -> r
                                                .path("/api/duels/ws")
                                                .and()
                                                .header("Upgrade", "(?i)websocket")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                // ✅ Volvemos a aplicar JwtGatewayFilter, ahora con
                                                                // lógica especial para WS
                                                                .filter(jwtFilter)
                                                                // El duels-service expone /ws
                                                                .rewritePath("/api/duels/ws", "/ws")
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .removeRequestHeader("Cookie")
                                                                .removeRequestHeader("Set-Cookie"))
                                                .uri("lb:ws://DUELS-SERVICE"))

                                // DUELS — HTTP (rate-limit específico + CB)
                                .route("duels-service-http", r -> r
                                                .path("/api/duels/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .filter(jwtFilter)
                                                                .addRequestHeader("X-Internal-Call", "gateway")
                                                                .removeRequestHeader("Cookie")
                                                                .removeRequestHeader("Set-Cookie")
                                                                .requestRateLimiter(rl -> rl
                                                                                .setKeyResolver(userOrIpKeyResolver)
                                                                                .setRateLimiter(duelsLimiter))
                                                                // ✅ CB recomendado aquí
                                                                .circuitBreaker(c -> c
                                                                                .setName("duels-cb")
                                                                                .setFallbackUri("forward:/__fallback")))
                                                .uri("lb://DUELS-SERVICE"))

                                // --- Actuators: exponer sólo health/info de cada servicio vía
                                // /api/<svc>/actuator/... ---

                                .route("auth-actuator", r -> r
                                                .path("/api/auth/actuator/**")
                                                .filters(f -> f
                                                                .filter(this::attachRequestId)
                                                                .stripPrefix(2) // /api/auth -> /
                                                )
                                                .uri("lb://AUTH-SERVICE"))
                                .route("curriculum-actuator", r -> r
                                                .path("/api/curriculum/actuator/**")
                                                .filters(f -> f.filter(this::attachRequestId).stripPrefix(2))
                                                .uri("lb://CURRICULUM-SERVICE"))
                                .route("progress-actuator", r -> r
                                                .path("/api/progress/actuator/**")
                                                .filters(f -> f.filter(this::attachRequestId).stripPrefix(2))
                                                .uri("lb://PROGRESS-SERVICE"))
                                .route("classroom-actuator", r -> r
                                                .path("/api/classroom/actuator/**")
                                                .filters(f -> f.filter(this::attachRequestId).stripPrefix(2))
                                                .uri("lb://CLASSROOM-SERVICE"))
                                .route("assessment-actuator", r -> r
                                                .path("/api/assessment/actuator/**")
                                                .filters(f -> f.filter(this::attachRequestId).stripPrefix(2))
                                                .uri("lb://ASSESSMENT-SERVICE"))
                                .route("ai-actuator", r -> r
                                                .path("/api/ai/actuator/**")
                                                .filters(f -> f.filter(this::attachRequestId).stripPrefix(2))
                                                .uri("lb://AI-ADVISOR-SERVICE"))
                                .route("duels-actuator", r -> r
                                                .path("/api/duels/actuator/**")
                                                .filters(f -> f.filter(this::attachRequestId).stripPrefix(2))
                                                .uri("lb://DUELS-SERVICE"))

                                .build();
        }

        /** Inyecta X-Request-Id si falta */
        private Mono<Void> attachRequestId(
                        org.springframework.web.server.ServerWebExchange ex,
                        org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

                HttpHeaders headers = ex.getRequest().getHeaders();
                if (!headers.containsKey("X-Request-Id")) {
                        return chain.filter(ex.mutate().request(
                                        ex.getRequest().mutate()
                                                        .headers(h -> h.add("X-Request-Id",
                                                                        UUID.randomUUID().toString()))
                                                        .build())
                                        .build());
                }
                return chain.filter(ex);
        }
}
