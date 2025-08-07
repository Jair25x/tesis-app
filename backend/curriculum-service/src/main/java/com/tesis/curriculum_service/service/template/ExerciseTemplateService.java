// src/main/java/com/tesis/curriculum_service/service/template/ExerciseTemplateService.java
package com.tesis.curriculum_service.service.template;

import com.tesis.curriculum_service.dto.TemplateSchema;

import java.util.List;
import java.util.Optional;

/**
 * Servicio que expone los esquemas de plantilla de ejercicio.
 */
public interface ExerciseTemplateService {
  /**
   * @return todos los esquemas de plantilla disponibles.
   */
  List<TemplateSchema> listAll();

  /**
   * Busca el esquema para un TemplateType concreto.
   *
   * @param type tipo de plantilla
   * @return esquema si existe
   */
  Optional<TemplateSchema> schemaFor(TemplateSchema.TemplateType type);

  
}
