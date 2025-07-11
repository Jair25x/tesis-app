package com.tesis.auth_service.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

/**
 * DTO para la solicitud de registro de un nuevo usuario.
 * Contiene la información necesaria para crear una cuenta de usuario.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 20, message = "El nombre de usuario debe tener entre 3 y 20 caracteres")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 40, message = "La contraseña debe tener entre 6 y 40 caracteres")
    private String password;

    @NotBlank(message = "El email es obligatorio")
    @Size(max = 50, message = "El email no puede exceder los 50 caracteres")
    @Email(message = "Formato de email inválido")
    private String email;

    // ✅ NUEVOS CAMPOS para los datos de perfil iniciales
    @NotBlank(message = "Los nombres son obligatorios")
    @Size(max = 100, message = "Los nombres no pueden exceder los 100 caracteres")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100, message = "Los apellidos no pueden exceder los 100 caracteres")
    private String apellidos;

    private String profilePictureUrl;
    private Map<String, Object> preferences;

    // Opcional: un conjunto de roles para asignar al usuario.
    // Si es nulo o vacío, se asignará un rol por defecto (ej. ROLE_STUDENT).
    private Set<String> role;
}
