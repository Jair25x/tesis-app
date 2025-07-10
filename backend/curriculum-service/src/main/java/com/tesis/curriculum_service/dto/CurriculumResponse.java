package com.tesis.curriculum_service.dto;

import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos.
import lombok.Builder; // Permite usar el patrón Builder para crear instancias.
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos.

import java.time.LocalDateTime; // Para manejar fechas de creación/actualización.
import java.util.UUID; // Para el ID del currículo.

/**
 * DTO (Data Transfer Object) para la respuesta de una entidad
 * {@link com.tesis.curriculum_service.model.Curriculum}.
 * Contiene los campos que se enviarán al cliente, incluyendo el ID y metadatos
 * como fechas.
 */
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para deserialización.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder,
         // mejorando la legibilidad.
public class CurriculumResponse {

  private UUID id; // ✅ Propósito: El identificador único del currículo. Es crucial para el
                   // cliente.

  private String name;

  private String description;

  private String code;

  private String grade;

  private LocalDateTime createdAt; // ✅ Propósito: Fecha y hora de creación del currículo.
  private LocalDateTime updatedAt; // ✅ Propósito: Fecha y hora de la última actualización del currículo.
}
