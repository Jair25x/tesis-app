package com.tesis.auth_service.security.jwt;

import com.tesis.auth_service.service.UserDetailsImpl;

// Importa Jwts, la clase principal para construir y parsear JWTs
// Importa JwtException, la excepción base para errores de JWT
import io.jsonwebtoken.*; // Asegúrate de tener estas importaciones
import io.jsonwebtoken.io.Decoders; // Utilidad para decodificar cadenas en Base64
import io.jsonwebtoken.security.Keys; // Clase para generar llaves de forma segura
import io.jsonwebtoken.security.MacAlgorithm; // Interfaz para algoritmos de Message Authentication Code (MAC), como HS512
import org.slf4j.Logger; // Interfaz de logging de SLF4J
import org.slf4j.LoggerFactory; // Fábrica para obtener instancias de Logger
import org.springframework.beans.factory.annotation.Value; // Anotación para inyectar valores desde propiedades
import org.springframework.security.core.Authentication; // Interfaz de Spring Security que representa la información de autenticación
import org.springframework.stereotype.Component; // Anotación que indica que esta clase es un componente de Spring

import javax.crypto.SecretKey; // Interfaz para claves secretas criptográficas
import java.util.Date; // Para manejar fechas y tiempos (emisión, expiración del token)
import java.util.List; // Para manejar listas de roles
import java.util.stream.Collectors; // Para coleccionar elementos de streams

import java.security.Key;
/**
 * Componente de Spring responsable de la creación, firma y validación de JSON
 * Web Tokens (JWT).
 * Utiliza la librería JJWT (Java JSON Web Token) versión 0.12.x o superior,
 * aprovechando su API moderna y fluida para la gestión de tokens.
 */
@Component
public class JwtTokenProvider {
    // Logger para registrar mensajes informativos, de depuración o errores.
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // Inyecta la clave secreta para firmar los JWTs desde las propiedades de
    // configuración (ej. application.yml o config server).
    @Value("${jwt.secret-key}")
    private String jwtSecret;

    // Inyecta el tiempo de expiración de los JWTs en milisegundos desde las
    // propiedades de configuración.
    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    // Define el algoritmo de firma MAC que se usará para los JWTs. HS512 es un
    // algoritmo de firma simétrica fuerte.
    // Jwts.SIG.HS512 es la forma moderna de referenciarlo en JJWT 0.12.x.
    private static final MacAlgorithm SIGNATURE_ALGORITHM = Jwts.SIG.HS512;

    /**
     * Genera una SecretKey a partir de la clave secreta codificada en Base64.
     * Esta clave es fundamental para firmar (crear) y verificar (validar) los JWTs.
     * 
     * @return Una SecretKey lista para ser usada en operaciones criptográficas.
     */
    private SecretKey getSigningKey() {
        // Decodifica la clave secreta que está en formato Base64 a un array de bytes.
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        // Genera una clave HMAC-SHA para el algoritmo HS512 a partir de los bytes
        // decodificados.
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Genera un JWT para un usuario autenticado.
     * Este token contendrá el nombre de usuario (subject), los roles y fechas de
     * emisión/expiración.
     * 
     * @param authentication Objeto de autenticación de Spring Security que contiene
     *                       los detalles del usuario.
     * @return La cadena del token JWT generado.
     */
    public String generateJwtToken(Authentication authentication) {
        // Obtiene los detalles personalizados del usuario (nuestro UserDetailsImpl).
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // Construye el JWT utilizando la API fluida de JJWT.
        return Jwts.builder()
                // Establece el "subject" (sujeto) del token, que es típicamente el nombre de
                // usuario.
                .subject(userPrincipal.getUsername())
                // Agregamos el Id del usuario para trazabilidad
                .claim("id", userPrincipal.getId()) 
                // Añade un "claim" (declaración) personalizado llamado "roles".
                // Este claim contiene una lista de los roles del usuario.
                .claim("roles", getRolesFromUser(userPrincipal))
                // Establece la fecha de emisión del token (Issued At).
                .issuedAt(new Date())
                // Establece la fecha de expiración del token (Expiration Time).
                // Se calcula sumando el tiempo actual más el tiempo de expiración configurado.
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                // Firma el token con la clave secreta y el algoritmo de firma definido.
                .signWith(getSigningKey(), SIGNATURE_ALGORITHM)
                // Compacta el token en su representación final de cadena.
                .compact();
    }

    /**
     * Genera un token de acceso (JWT) a partir del nombre de usuario.
     * Este método es útil para la renovación de tokens, donde ya tienes el nombre
     * de usuario
     * desde el refresh token y necesitas emitir un nuevo access token.
     * 
     * @param username El nombre de usuario para el cual se generará el token.
     * @return El JWT generado.
     */
    public String generateTokenFromUsername(String username) {
        // Puedes cargar los detalles completos del usuario para incluir roles si es
        // necesario
        // UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        // List<String> roles = userDetails.getAuthorities().stream()
        // .map(item -> item.getAuthority())
        // .collect(Collectors.toList());
        // Map<String, Object> claims = new HashMap<>();
        // claims.put("roles", roles); // Añade roles a los claims si los necesitas en
        // el token
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes()); // Convertimos el secreto a clave segura
        // Crea el JWT. Asegúrate de usar la misma lógica de firma y expiración que en
        // tu método principal.
        return Jwts.builder()
            .subject(username)
            .issuedAt(new Date())
            .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
            .signWith(key)
            .compact();
    }

    /**
     * Extrae el nombre de usuario (subject) de un token JWT dado.
     * 
     * @param token La cadena del token JWT.
     * @return El nombre de usuario contenido en el token.
     */
    public String getUserNameFromJwtToken(String token) {
        // Crea un parser de JWT usando la API moderna de JJWT.
        return Jwts.parser()
                // Configura el parser para verificar la firma del token con nuestra clave
                // secreta.
                .verifyWith(getSigningKey())
                // Construye la instancia final del parser.
                .build()
                // Parsea el token asumiendo que es un JWS (Signed JWT) y extrae sus claims
                // (declaraciones).
                .parseSignedClaims(token)
                // Obtiene el 'payload' (cuerpo) del token, que contiene todas las
                // declaraciones.
                .getPayload()
                // Obtiene el "subject" (nombre de usuario) del payload.
                .getSubject();
    }

    /**
     * Valida la integridad y la vigencia de un token JWT.
     * 
     * @param token La cadena del token JWT a validar.
     * @return true si el token es válido y no ha expirado, false en caso contrario.
     */
    public boolean validateJwtToken(String token) {
        try {
            // Intenta parsear y verificar el token.
            // Si el token es inválido (firma incorrecta, expirado, mal formado, etc.),
            // JJWT lanzará una JwtException.
            Jwts.parser()
                    .verifyWith(getSigningKey()) // Verifica la firma con la clave secreta
                    .build() // Construye el parser
                    .parseSignedClaims(token); // Intenta parsear el token y validar su firma y claims estándar
            return true; // Si no hay excepciones, el token es válido
        } catch (JwtException e) {
            // Captura cualquier excepción relacionada con el JWT (ej.
            // MalformedJwtException, ExpiredJwtException, etc.)
            // y registra un mensaje de error.
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            // Captura errores si la cadena de claims está vacía o es nula (raro con la
            // validación de JJWT).
            logger.error("Empty or null JWT claims: {}", e.getMessage());
        }
        return false; // El token no es válido
    }

    /**
     * Método auxiliar para extraer los roles de un UserDetailsImpl y convertirlos a
     * una lista de cadenas.
     * 
     * @param userPrincipal Los detalles del usuario autenticado.
     * @return Una lista de cadenas que representan los roles del usuario.
     */
    private List<String> getRolesFromUser(UserDetailsImpl userPrincipal) {
        return userPrincipal.getAuthorities().stream() // Obtiene una transmisión de las autoridades (roles)
                .map(Object::toString) // Mapea cada autoridad a su representación de cadena (ej. "ROLE_ADMIN")
                .collect(Collectors.toList()); // Recolecta las cadenas en una lista
    }
}