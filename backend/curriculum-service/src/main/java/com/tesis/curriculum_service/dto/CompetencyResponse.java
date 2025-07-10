package com.tesis.curriculum_service.dto;

import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos.
import lombok.Builder; // Permite usar el patrón Builder para crear instancias.
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos.

import java.time.LocalDateTime; // Para manejar fechas de creación/actualización.
import java.util.UUID; // Para el ID de la competencia y del currículo.

/**
 * DTO (Data Transfer Object) para la respuesta de una entidad
 * {@link com.tesis.curriculum_service.model.Competency}.
 * Contiene los campos que se enviarán al cliente, incluyendo el ID de la
 * competencia,
 * el ID del currículo padre y metadatos de tiempo.
 */
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para deserialización.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder.
public class CompetencyResponse {

  private UUID id; // ✅ Propósito: El identificador único de la competencia.

  private String name;

  private String description;

  private String code;

  private UUID curriculumId; // ✅ Propósito: El ID del currículo al que esta competencia está asociada.
  
  private String curriculumName;

  private LocalDateTime createdAt; // ✅ Propósito: Fecha y hora de creación de la competencia.
  private LocalDateTime updatedAt; // ✅ Propósito: Fecha y hora de la última actualización de la competencia.
}
