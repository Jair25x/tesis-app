package com.tesis.curriculum_service.dto;

import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos.
import lombok.Builder; // Permite usar el patrón Builder para crear instancias.
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos.

import java.time.LocalDateTime; // Para manejar fechas de creación/actualización.
import java.util.UUID; // Para el ID del estándar y de la competencia.

/**
 * DTO (Data Transfer Object) para la respuesta de una entidad
 * {@link com.tesis.curriculum_service.model.Standard}.
 * Contiene los campos que se enviarán al cliente, incluyendo el ID del
 * estándar,
 * el ID de la competencia padre y metadatos de tiempo.
 */
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para deserialización.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder.
public class StandardResponse {

  private UUID id; // ✅ Propósito: El identificador único del estándar.

  private String name;

  private String description;

  private String code;

  private UUID competencyId; // ✅ Propósito: El ID de la competencia a la que este estándar está asociado.

  private LocalDateTime createdAt; // ✅ Propósito: Fecha y hora de creación del estándar.
  private LocalDateTime updatedAt; // ✅ Propósito: Fecha y hora de la última actualización del estándar.
}
