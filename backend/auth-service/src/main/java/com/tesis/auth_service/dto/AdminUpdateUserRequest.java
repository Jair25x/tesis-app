package com.tesis.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
  @NotBlank
  private String nombres;

  @NotBlank
  private String apellidos;

  @Email
  private String email;
}