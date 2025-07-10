package com.tesis.gateway_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

/**
 * Componente que se ejecuta después de que la aplicación Spring Boot ha
 * iniciado
 * para loguear las rutas activas del Gateway.
 * Esto ayuda a verificar que las rutas programáticas se están cargando
 * correctamente.
 */
@Component
public class RouteLoggerRunner implements CommandLineRunner {

  private static final Logger logger = LoggerFactory.getLogger(RouteLoggerRunner.class);

  private final RouteLocator routeLocator;

  // Inyectamos el RouteLocator una vez que está disponible en el contexto de
  // Spring.
  public RouteLoggerRunner(RouteLocator routeLocator) {
    this.routeLocator = routeLocator;
  }

  @Override
  public void run(String... args) throws Exception {
    logger.info("Verificando rutas cargadas por Gateway al iniciar la aplicación.");
    Flux<org.springframework.cloud.gateway.route.Route> routes = routeLocator.getRoutes();
    routes.subscribe(route -> logger.info("Ruta cargada: ID = {}, URI = {}",
        route.getId(), route.getUri()));

    // Contar el número de rutas cargadas para una confirmación clara
    routes.collectList().subscribe(
        list -> logger.info("Total de rutas cargadas en Gateway: {}", list.size()),
        error -> logger.error("Error al recopilar rutas: {}", error.getMessage()));
  }
}
