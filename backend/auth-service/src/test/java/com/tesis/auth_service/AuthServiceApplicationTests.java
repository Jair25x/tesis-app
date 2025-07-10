package com.tesis.auth_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
		"spring.cloud.config.enabled=false", // Deshabilita Config Server para tests
		"eureka.client.enabled=false", // Deshabilita Eureka Client para tests
		// ✅ Añadir la clave secreta JWT aquí, es la misma para Auth y Gateway
		"jwt.secret-key=N/B9yH7L5A8t/Q2Z0X0Vw6M8vJ9Y4N1T3S2R1Q0P5O6N7M8L9K0J1I2H3G4F5E6D7C8B9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4ZabCdEfGhIjKlMnOpQrStUvWxYzABcDeFg==",
		"jwt.expirationMs=3600000", // Valor de 1 hora para tests
		"jwt.refreshExpirationMs=86400000", // Valor de 24 horas para tests
		"user-profile-service.url=http://localhost:8083" // Direccion del user-profile-service 
})
class AuthServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
