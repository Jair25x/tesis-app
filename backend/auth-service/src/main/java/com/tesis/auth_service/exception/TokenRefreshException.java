package com.tesis.auth_service.exception;

import org.springframework.http.HttpStatus; // Importa HttpStatus para definir el código de estado HTTP por defecto
import org.springframework.web.bind.annotation.ResponseStatus; // Anotación para mapear esta excepción a un estado HTTP

/**
 * Excepción personalizada para errores relacionados con la renovación de tokens.
 * Esta excepción se lanza cuando un Refresh Token no es válido, está expirado,
 * o por cualquier otra razón no puede ser usado para generar un nuevo Access Token.
 *
 * @ResponseStatus(HttpStatus.FORBIDDEN): Esta anotación hace que Spring Boot
 * responda automáticamente con un código de estado HTTP 403 Forbidden
 * cuando esta excepción es lanzada desde un controlador y no es manejada
 * por un @ExceptionHandler más específico. Es una forma rápida de establecer
 * el código de estado por defecto.
 */
@ResponseStatus(HttpStatus.FORBIDDEN) // Cuando esta excepción sea lanzada, el servidor responderá con un HTTP 403 Forbidden.
public class TokenRefreshException extends RuntimeException { // Extiende RuntimeException para que sea una excepción no verificada.

    // UID de serialización. Se recomienda definirlo explícitamente para evitar
    // problemas de compatibilidad en la deserialización si la clase cambia en el futuro.
    private static final long serialVersionUID = 1L; // Añadido para serialización

    /**
     * Constructor para TokenRefreshException.
     *
     * @param token El valor del Refresh Token que causó el problema.
     * @param message Un mensaje descriptivo del error (ej. "Token expirado", "Token no encontrado").
     */
    public TokenRefreshException(String token, String message) {
        // Llama al constructor de la clase padre (RuntimeException) con un mensaje formateado.
        // El mensaje incluye el token problemático y la razón específica del fallo.
        super(String.format("Refresh token [%s] no es válido: %s", token, message));
    }
}