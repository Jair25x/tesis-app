package com.tesis.curriculum_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI (Swagger) para la documentación de la API del
 * servicio de currículo.
 * Define la información básica de la API y el esquema de seguridad para JWT.
 */
@Configuration
public class OpenAPIConfig {

  /**
   * Configura el bean OpenAPI.
   * 
   * @return Una instancia de OpenAPI con la información de la API y los
   *         componentes de seguridad.
   */
  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        // Información general de la API
        .info(new Info()
            .title("API del Servicio de Currículo")
            .version("1.0")
            .description(
                "API REST para la gestión de currículos escolares, competencias, estándares y objetivos de aprendizaje."))
        // Define los componentes de seguridad, en este caso, el esquema para Bearer
        // Token (JWT)
        .components(new Components()
            .addSecuritySchemes("bearerAuth", // Nombre de referencia para la anotación @SecurityRequirement
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP) // Tipo de esquema HTTP
                    .scheme("bearer") // Esquema "bearer"
                    .bearerFormat("JWT") // Formato del token (JWT)
                    .description(
                        "Token JWT requerido para acceder a los endpoints protegidos. Ejemplo: Bearer <tu_token_jwt>") // Descripción
                                                                                                                       // para
                                                                                                                       // Swagger
                                                                                                                       // UI
            ));
  }
}
