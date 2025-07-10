package com.tesis.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken; // <--- This field is CRUCIAL for the AuthController to compile
    private String type = "Bearer";
    private Long id;
    private String username;
    private List<String> roles;
    private String email;
    private String nombres;
    private String apellidos;
}
