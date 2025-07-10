package com.tesis.auth_service.security.jwt;

import com.tesis.auth_service.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach; // Para configurar antes de cada test
import org.junit.jupiter.api.DisplayName; // Para nombres de test legibles
import org.junit.jupiter.api.Test; // Para definir métodos de test
import org.junit.jupiter.api.extension.ExtendWith; // Para integrar Mockito
import org.mockito.InjectMocks; // Inyecta mocks en la instancia de la clase bajo prueba
import org.mockito.Mock; // Crea un mock de una dependencia
import org.mockito.junit.jupiter.MockitoExtension; // Extensión de Mockito para JUnit 5
import org.springframework.security.core.Authentication; // Interfaz de autenticación de Spring Security
import org.springframework.security.core.authority.SimpleGrantedAuthority; // Para roles/autoridades
import org.springframework.test.util.ReflectionTestUtils; // Para inyectar valores en campos privados

import java.util.Arrays; // Utilidad para arreglos
import java.util.List; // Interfaz para listas
import java.util.stream.Collectors; // Para operar con Streams

import static org.junit.jupiter.api.Assertions.*; // Importa todas las aserciones de JUnit
import static org.mockito.Mockito.when; // Para configurar el comportamiento de los mocks

@ExtendWith(MockitoExtension.class) // Habilita Mockito para este test
class JwtTokenProviderTest {

    @InjectMocks // La instancia real de JwtTokenProvider a testear, con mocks inyectados
    private JwtTokenProvider jwtTokenProvider;

    @Mock // Mock de la interfaz Authentication (simula un objeto de autenticación de Spring)
    private Authentication authentication;

    private String testSecret; // Clave secreta para firmar/verificar JWTs en tests
    private long testExpirationMs; // Tiempo de expiración para JWTs en tests

    @BeforeEach // Se ejecuta antes de cada método de test
    void setUp() {
        // Define una clave secreta Base64 suficientemente larga para HS512 (ej. 64 bytes)
        testSecret = "ASecureTestSecretKeyForHS512AlgorithmThatIsLongEnoughAndBase64Encoded======================================";
        testExpirationMs = 3600000; // 1 hora en milisegundos

        // Inyecta los valores de 'jwtSecret' y 'jwtExpirationMs' en la instancia de jwtTokenProvider
        // Esto es necesario porque @Value no funciona en tests unitarios sin un contexto de Spring
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", testExpirationMs);
    }

    // Método de ayuda para crear instancias de UserDetailsImpl para los tests
    private UserDetailsImpl createTestUser(Long id, String username, String password,String email, List<String> roles,String nombres, String apellidos) {
        return new UserDetailsImpl(
                id,
                username,
                password,
                email,
                nombres,
                apellidos,
                true, // enabled (cuenta habilitada)
                true, // accountNonLocked (cuenta no bloqueada)
                true, // credentialsNonExpired (credenciales no expiradas)
                roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList()) // Convierte roles String a GrantedAuthority
        );
    }

    @Test // Marca este método como un test de JUnit
    @DisplayName("Debe generar un token JWT válido con el username y roles correctos") // Nombre legible del test
    void shouldGenerateValidJwtTokenWithCorrectClaims() {
        String username = "testuser";
        String email = "email@test.com";
        List<String> roles = Arrays.asList("ROLE_USER", "ROLE_TEST");

        // Crea un objeto UserDetailsImpl con datos de prueba
        UserDetailsImpl userPrincipal = createTestUser(1L, username,"encodedPassword",email, roles,"Maria","Jose");
        // Configura el mock de Authentication para devolver nuestro userPrincipal cuando se llame a getPrincipal()
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        // Llama al método que genera el token
        String token = jwtTokenProvider.generateJwtToken(authentication);

        // Aserciones para verificar el token generado
        assertNotNull(token, "El token no debe ser nulo");
        assertFalse(token.isEmpty(), "El token no debe estar vacío");
        assertTrue(jwtTokenProvider.validateJwtToken(token), "El token generado debe ser válido al validarlo con el mismo proveedor");
        assertEquals(username, jwtTokenProvider.getUserNameFromJwtToken(token), "El username extraído debe coincidir con el original");
    }

    @Test
    @DisplayName("Debe validar un token JWT válido y retornar true")
    void shouldValidateValidJwtTokenAndReturnTrue() {
        // Crea un usuario de prueba para generar un token válido
        UserDetailsImpl userPrincipal = createTestUser(2L, "validuser", "validpassword","email@test.com", List.of("ROLE_USER"),"Maria","Jose");
        // Configura el mock de Authentication
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        // Genera un token válido
        String validToken = jwtTokenProvider.generateJwtToken(authentication);
        // Verifica que el token válido sea validado correctamente
        assertTrue(jwtTokenProvider.validateJwtToken(validToken), "Un token válido debe retornar true");
    }

    @Test
    @DisplayName("Debe retornar false para un token JWT expirado")
    void shouldReturnFalseForExpiredJwtToken() throws InterruptedException {
        // Temporalmente, establece la expiración del token a 1 milisegundo para este test
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 1L);

        // Crea un usuario de prueba
        UserDetailsImpl userPrincipal = createTestUser(3L, "expireduser", "expiredpassword","email@test.com", List.of("ROLE_USER"),"Maria","Jose");
        // Configura el mock de Authentication
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        // Genera un token que expirará casi inmediatamente
        String expiredToken = jwtTokenProvider.generateJwtToken(authentication);
        // Espera un tiempo para asegurar que el token haya expirado
        Thread.sleep(50);

        // Verifica que el token expirado no sea validado
        assertFalse(jwtTokenProvider.validateJwtToken(expiredToken), "Un token expirado debe retornar false");

        // Restaura el tiempo de expiración original para no afectar otros tests
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", testExpirationMs);
    }

    @Test
    @DisplayName("Debe retornar false para un token JWT con firma inválida")
    void shouldReturnFalseForJwtTokenWithInvalidSignature() {
        // Crea un usuario de prueba
        UserDetailsImpl userPrincipal = createTestUser(4L, "signatureuser", "signaturepassword","email@test.com", List.of("ROLE_USER"),"Maria","Jose");
        // Configura el mock de Authentication
        when(authentication.getPrincipal()).thenReturn(userPrincipal);

        // Genera un token válido
        String validToken = jwtTokenProvider.generateJwtToken(authentication);
        // Modifica el token para corromper su firma (cambia el último carácter)
        String invalidSignatureToken = validToken + "x";

        // Verifica que un token con firma inválida no sea validado
        assertFalse(jwtTokenProvider.validateJwtToken(invalidSignatureToken), "Un token con firma inválida debe retornar false");
    }

    @Test
    @DisplayName("Debe retornar false para un token JWT malformado")
    void shouldReturnFalseForMalformedJwtToken() {
        // Crea una cadena que no es un JWT válido
        String malformedToken = "this.is.not.a.valid.jwt";
        // Verifica que un token malformado no sea validado
        assertFalse(jwtTokenProvider.validateJwtToken(malformedToken), "Un token malformado debe retornar false");
    }

    @Test
    @DisplayName("Debe retornar false para un token nulo o vacío")
    void shouldReturnFalseForNullOrEmptyToken() {
        // Verifica que un token nulo no sea validado
        assertFalse(jwtTokenProvider.validateJwtToken(null), "Un token nulo debe retornar false");
        // Verifica que un token vacío no sea validado
        assertFalse(jwtTokenProvider.validateJwtToken(""), "Un token vacío debe retornar false");
    }

    @Test
    @DisplayName("Debe retornar false para token con algoritmo no soportado")
    void shouldReturnFalseForUnsupportedAlgorithmToken() {
        // Token de ejemplo con algoritmo "none" (no soportado para firmas)
        String unsupportedAlgToken = "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c3IiLCJyb2xlcyI6WyJST0xFX1VTRVIiXX0.";
        // Verifica que un token con algoritmo no soportado no sea validado
        assertFalse(jwtTokenProvider.validateJwtToken(unsupportedAlgToken), "Un token con algoritmo no soportado debe retornar false");
    }

    @Test
    @DisplayName("Debe lanzar excepción al extraer username de un token inválido")
    void shouldThrowExceptionWhenExtractingUsernameFromInvalidToken() {
        String invalidToken = "invalid.jwt.token"; // Token que no puede ser parseado
        // Verifica que se lanza una excepción (cualquier excepción de la cadena de JJWT)
        assertThrows(Exception.class, () -> jwtTokenProvider.getUserNameFromJwtToken(invalidToken),
                "Debe lanzar una excepción al intentar extraer el username de un token inválido");
    }
}