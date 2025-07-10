package com.tesis.auth_service.dto;

import lombok.AllArgsConstructor; // Anotación de Lombok para generar un constructor con todos los argumentos
import lombok.Data; // Anotación de Lombok para generar getters, setters, toString(), equals() y hashCode()
import lombok.NoArgsConstructor; // Anotación de Lombok para generar un constructor sin argumentos

/**
 * Data Transfer Object (DTO) para la respuesta de renovación de token.
 * Esta clase define la estructura de la respuesta HTTP que el servidor enviará
 * al cliente después de una solicitud exitosa de renovación de token.
 * Contendrá el nuevo token de acceso y el token de refresco (que puede ser el mismo o uno nuevo).
 */
@Data // Anotación de Lombok: Genera automáticamente getters, setters, toString(), equals() y hashCode() para todos los campos.
@AllArgsConstructor // Anotación de Lombok: Genera un constructor que acepta todos los campos como argumentos (accessToken, refreshToken, tokenType).
@NoArgsConstructor // Anotación de Lombok: Se recomienda añadir un constructor sin argumentos si se utiliza AllArgsConstructor,
public class TokenRefreshResponse {

    /**
     * El nuevo token de acceso JWT (Access Token) que el cliente usará para autenticar futuras solicitudes protegidas.
     * Este token tiene una vida útil corta por razones de seguridad.
     */
    private String accessToken;

    /**
     * El token de refresco (Refresh Token) que el cliente puede usar para obtener un nuevo Access Token
     * una vez que el actual expire, sin necesidad de iniciar sesión de nuevo.
     * Este token tiene una vida útil más larga.
     */
    private String refreshToken;

    /**
     * El tipo de token, que es "Bearer" por convención.
     * Indica cómo debe ser incluido el Access Token en el encabezado de autorización (ej., "Authorization: Bearer <accessToken>").
     * Se inicializa directamente con "Bearer" como valor por defecto.
     */
    private String tokenType = "Bearer";
}