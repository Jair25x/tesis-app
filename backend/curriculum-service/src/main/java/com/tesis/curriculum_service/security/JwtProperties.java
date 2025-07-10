package com.tesis.curriculum_service.security;

import lombok.Getter; // Genera automáticamente los métodos getter.
import lombok.Setter; // Genera automáticamente los métodos setter.
import org.springframework.boot.context.properties.ConfigurationProperties; // Anotación para mapear propiedades externas a un bean.
import org.springframework.stereotype.Component; // Marca esta clase como un componente de Spring.

/**
 * Clase para cargar propiedades relacionadas con JWT desde la configuración de la aplicación.
 * Las propiedades se mapearán desde el prefijo 'jwt' en los archivos de configuración
 * (ej., application.properties, o auth-service.yml/user-profile-service.yml desde Config Server).
 */
@Component // ✅ Propósito: Indica que esta clase es un componente de Spring y debe ser gestionada por el contexto de Spring.
@ConfigurationProperties(prefix = "jwt") // ✅ Propósito: Mapea las propiedades que comienzan con 'jwt.'
                                         // a los campos de esta clase (ej., 'jwt.secret-key' a 'secretKey').
@Getter // ✅ Propósito: Genera automáticamente todos los métodos getter para los campos.
@Setter // ✅ Propósito: Genera automáticamente todos los métodos setter para los campos.
public class JwtProperties {

    /**
     * Clave secreta utilizada para firmar y verificar los JWTs.
     * Esta propiedad se mapea desde 'jwt.secret-key' en la configuración.
     * DEBE ser la misma clave utilizada en auth-service y gateway-service.
     */
    private String secretKey;

    /**
     * Tiempo de expiración del Access Token JWT en milisegundos.
     * Esta propiedad se mapea desde 'jwt.expirationMs' en la configuración.
     */
    private long expirationMs;

    /**
     * Tiempo de expiración del Refresh Token JWT en milisegundos.
     * Aunque curriculum-service no genera refresh tokens, la mantenemos
     * para consistencia o si en el futuro se requiriera esta información.
     * Esta propiedad se mapea desde 'jwt.refreshExpirationMs' en la configuración.
     */
    private long refreshExpirationMs;

    // Nota: Aunque jwt.secret podría existir en auth-service.yml, aquí usamos
    // secret-key para uniformidad. Asegúrate de que el valor en el Config Server
    // para curriculum-service sea consistente con esta propiedad.
}
