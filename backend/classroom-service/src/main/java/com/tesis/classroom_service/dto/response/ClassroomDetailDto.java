package com.tesis.classroom_service.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "ClassroomDetailDto")
public class ClassroomDetailDto {

  private UUID id;
  private UUID ownerUuid;

  private String name;
  private String description;
  private String grade;
  private String subject;

  private boolean active;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
