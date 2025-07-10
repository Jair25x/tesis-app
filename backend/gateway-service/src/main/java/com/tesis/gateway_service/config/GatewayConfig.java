package com.tesis.gateway_service.config;

import com.tesis.gateway_service.security.filter.JwtGatewayFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de rutas para el API Gateway.
 * Define cómo se enrutan las solicitudes entrantes a los microservicios
 * correspondientes.
 */
@Configuration
public class GatewayConfig {

  private final JwtGatewayFilter jwtFilter;
  private final RouteLocatorBuilder routeLocatorBuilder;

  /**
   * Constructor. Injects only the JWT filter and the RouteLocatorBuilder.
   * It no longer injects the final RouteLocator here to avoid the cycle.
   */
  public GatewayConfig(JwtGatewayFilter jwtFilter, RouteLocatorBuilder routeLocatorBuilder) {
    this.jwtFilter = jwtFilter;
    this.routeLocatorBuilder = routeLocatorBuilder;
  }

  /**
   * Defines the routing routes for the Gateway.
   * It is a Bean that Spring Cloud Gateway will detect and use.
   */
  @Bean
  public RouteLocator customRouteLocator() {
    return this.routeLocatorBuilder.routes()
        // Route for the Auth Service
        .route("auth-service", r -> r.path("/api/auth/**")
            .filters(f -> f.filter(jwtFilter))
            .uri("lb://AUTH-SERVICE"))

        // Route for the User Profile Service
        .route("user-profile-service", r -> r.path("/api/profile/**")
            .filters(f -> f.filter(jwtFilter)
                // ✅ NEW ADDITION: This filter adds the X-Internal-Call header with the value
                // 'gateway'
                // to all requests that the Gateway forwards to the user-profile-service.
                .addRequestHeader("X-Internal-Call", "gateway"))
            .uri("lb://USER-PROFILE-SERVICE"))

        // NUEVA RUTA: Route for the Curriculum Service
        .route("curriculum-service", r -> r.path("/api/curriculum/**")
            .filters(f -> f.filter(jwtFilter) // Aplica el filtro JWT para validar al cliente
                // Añade la cabecera X-Internal-Call para que el microservicio sepa que viene
                // del Gateway
                .addRequestHeader("X-Internal-Call", "gateway"))
            .uri("lb://CURRICULUM-SERVICE")) // 'lb://' para integración con Eureka
            
        // Add more routes for other microservices here as you implement them
        // For example:
        // .route("core-service", r -> r.path("/api/core/**")
        // .filters(f -> f.filter(jwtFilter))
        // .uri("lb://CORE-SERVICE"))

        .build();
  }

  // The @PostConstruct logRoutes() method was removed from here to break the
  // cycle.
  // The logging logic will be moved to a new RouteLoggerRunner class.
}
