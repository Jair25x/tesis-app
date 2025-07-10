package com.tesis.auth_service.config;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Servicio de Autenticación - Tesis App")
                .description("Microservicio para autenticación y autorización de usuarios en el sistema de tesis.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Jair Almanza")
                    .email("jair.almanza@ejemplo.com")
                    .url("https://github.com/jair-almanza"))
                .license(new License().name("MIT").url("https://opensource.org/licenses/MIT"))
            )
            .externalDocs(new ExternalDocumentation()
                .description("Documentación general del proyecto")
                .url("https://github.com/jair-almanza/tesis-docs"));
    }
}