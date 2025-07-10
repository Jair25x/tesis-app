package com.tesis.auth_service.dto;

import java.time.LocalDateTime;
import java.util.Set;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserSummaryDto {
  private Long id;
  private String username;
  private String email;
  private Set<String> roles;
  private boolean enabled;
  private LocalDateTime fechaRegistro;

  // Constructor
  public UserSummaryDto(Long id, String username, String email, Set<String> roles, boolean enabled,
      LocalDateTime fechaRegistro) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.enabled = enabled;
    this.fechaRegistro = fechaRegistro;
  }
}
