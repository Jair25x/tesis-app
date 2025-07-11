package com.tesis.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Los nombres no pueden estar vacíos.")
    private String nombres;

    @NotBlank(message = "Los apellidos no pueden estar vacíos.")
    private String apellidos;

    @NotBlank(message = "El correo electrónico no puede estar vacío.")
    @Email(message = "El formato del correo electrónico no es válido.")
    private String email;

    private String profilePictureUrl;
    private Map<String, Object> preferences;
}
