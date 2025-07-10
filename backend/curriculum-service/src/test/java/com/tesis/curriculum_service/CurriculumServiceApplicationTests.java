package com.tesis.curriculum_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource; // Importar esta anotación

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
                "spring.cloud.config.enabled=false", // Deshabilita Config Server para tests
                "eureka.client.enabled=false" // Deshabilita Eureka Client para tests
// El curriculum-service no usa jwt.secret-key directamente para su propio
// funcionamiento
// Si tuvieras tests de integración en este módulo que llamaran a servicios que
// usan JWT,
// entonces sí necesitarías la clave, pero para contextLoads() no es
// estrictamente necesario aquí.
})
@org.springframework.test.context.ActiveProfiles("test")
class CurriculumServiceApplicationTests {

        @Test
        void contextLoads() {
        }

}
