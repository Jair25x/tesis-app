package com.tesis.classroom_service.dto.response;

import com.tesis.classroom_service.model.enums.MemberRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "MemberDto")
public class MemberDto {

  private UUID userUuid;
  private MemberRole role;
  private LocalDateTime joinedAt;
  private String fullName; // opcional, se puede poblar luego
  private String avatarUrl; // opcional
}
