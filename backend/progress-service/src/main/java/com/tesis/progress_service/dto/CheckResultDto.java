package com.tesis.progress_service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckResultDto {
  private boolean correct;
  private BigDecimal score; // 0..1
  private Map<String, Object> feedback; // texto/estructura de retroalimentación
}
