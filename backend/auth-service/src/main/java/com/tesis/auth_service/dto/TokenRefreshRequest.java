package com.tesis.auth_service.dto;

import jakarta.validation.constraints.NotBlank; // Importa la anotación para validación de campos no vacíos
import lombok.Data; // Anotación de Lombok para generar getters, setters, toString(), equals() y hashCode()

/**
 * Data Transfer Object (DTO) para la solicitud de renovación de token.
 * Esta clase representa el cuerpo de la solicitud HTTP que un cliente enviará
 * al endpoint de renovación de token, conteniendo el token de refresco.
 */
@Data // Anotación de Lombok: Genera automáticamente getters, setters, toString(), equals() y hashCode().
public class TokenRefreshRequest {

    /**
     * El token de refresco que el cliente envía para solicitar un nuevo token de acceso (JWT).
     *
     * @NotBlank: Anotación de validación de Jakarta.
     * Asegura que la cadena 'refreshToken' no sea null y que no contenga solo espacios en blanco.
     * Si esta validación falla, Spring lanzará un MethodArgumentNotValidException,
     * que tu GlobalExceptionHandler debería capturar y mapear a un HTTP 400 Bad Request.
     */
    @NotBlank(message = "El token de refresco no puede estar vacío.")
    private String refreshToken;
}