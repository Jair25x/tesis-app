package com.tesis.curriculum_service.exception;

import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos.
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos.

/**
 * DTO (Data Transfer Object) para estandarizar las respuestas de error de la
 * API.
 * Proporciona un formato consistente para los mensajes de error devueltos al
 * cliente.
 */
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para deserialización.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
public class ErrorResponse {

  private String message; // ✅ Propósito: Un mensaje descriptivo del error.
  private int status; // ✅ Propósito: El código de estado HTTP asociado al error (ej. 404, 409).
  private long timestamp; // ✅ Propósito: La marca de tiempo cuando ocurrió el error.
}
