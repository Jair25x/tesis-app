// src/main/java/com/tesis/curriculum_service/config/JwtProperties.java
package com.tesis.curriculum_service.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Carga desde `application.properties` (o tu Config Server) bajo el prefijo
 * `jwt.*`:
 * jwt.secret-key=...
 * jwt.expiration-ms=...
 * jwt.refresh-expiration-ms=...
 */
@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {

    /**
     * Clave secreta (Base64) para firmar/verificar JWTs.
     * Debe ser la misma en auth-service, gateway y aquí.
     */
    private String secretKey;

    /**
     * Tiempo de expiración del Access Token (en milisegundos).
     * Opcional en este servicio, pero cargado para consistencia.
     */
    private long expirationMs;

    /**
     * Tiempo de expiración del Refresh Token (en milisegundos).
     * No usado aquí, pero mantenido para posible extensión.
     */
    private long refreshExpirationMs;
}
