// auth-service: src/main/java/com/tesis/auth_service/dto/PublicProfileDto.java
package com.tesis.auth_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "PublicProfileDto", description = "Perfil público mínimo para inter-servicios")
public class PublicProfileDto {

  @Schema(description = "UUID canónico del usuario")
  private UUID id;

  @Schema(description = "Nombre a mostrar (puede ser username si no hay nombre real)")
  private String displayName;

  @Schema(description = "URL del avatar (opcional)")
  private String avatarUrl;
}
