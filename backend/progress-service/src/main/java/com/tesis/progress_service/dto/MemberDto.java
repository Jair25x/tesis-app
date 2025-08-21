package com.tesis.progress_service.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
  private UUID userUuid;
  private String role; // no lo usamos en progress, pero viene en la respuesta
  private LocalDateTime joinedAt; // opcional
  private String fullName; // opcional
  private String avatarUrl; // opcional
}
