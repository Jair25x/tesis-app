package com.tesis.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
  @NotBlank
  private String nombres;

  @NotBlank
  private String apellidos;

  @Email
  private String email;

  private String profilePictureUrl;
  private Map<String, Object> preferences;
}