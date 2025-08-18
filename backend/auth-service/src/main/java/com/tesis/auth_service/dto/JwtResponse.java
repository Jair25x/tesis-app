package com.tesis.auth_service.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private String refreshToken;
    @Builder.Default
    private String type = "Bearer";

    private Long id; // legacy numérico (se mantiene)
    private String userUuid; // ⬅️ NUEVO: UUID canónico (string)

    private String username;
    private List<String> roles;
    private String email;
    private String nombres;
    private String apellidos;
}
