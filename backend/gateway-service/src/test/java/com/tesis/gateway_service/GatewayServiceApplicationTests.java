package com.tesis.gateway_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
		"spring.cloud.config.enabled=false",
		"eureka.client.enabled=false",
		// ✅ Añadir la clave secreta JWT directamente aquí
		"jwt.secret-key=N/B9yH7L5A8t/Q2Z0X0Vw6M8vJ9Y4N1T3S2R1Q0P5O6N7M8L9K0J1I2H3G4F5E6D7C8B9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4ZabCdEfGhIjKlMnOpQrStUvWxYzABcDeFg=="
})
class GatewayServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
