package com.tesis.auth_service.dto;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserProfileDto {
  private Long id;
  private String username;
  private String email;
  private String nombres;
  private String apellidos;
  private Set<String> roles;
  private boolean enabled;
  private LocalDateTime fechaRegistro;
}