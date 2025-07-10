package com.tesis.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    @NotBlank(message = "El nombre de usuario no puede estar vacio")
    private String username;
    @NotBlank(message = "La contraseña no puede estar vacia")
    private String password;
}