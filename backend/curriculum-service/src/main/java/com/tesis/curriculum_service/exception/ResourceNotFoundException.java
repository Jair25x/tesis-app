package com.tesis.curriculum_service.exception;

import java.util.UUID;

import org.springframework.http.HttpStatus; // Importa HttpStatus para el código de estado HTTP.
import org.springframework.web.bind.annotation.ResponseStatus; // Importa ResponseStatus para mapear la excepción a un estado HTTP.

/**
 * Excepción personalizada para indicar que un recurso solicitado no ha sido
 * encontrado.
 * Cuando esta excepción es lanzada, Spring responderá con un código de estado
 * HTTP 404 Not Found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

  public ResourceNotFoundException(String resourceName, String fieldName, UUID fieldValue) {
    super(String.format("%s no encontrada con %s : '%s'", resourceName, fieldName, fieldValue));
  }

  public ResourceNotFoundException(String resourceName, String fieldName, String fieldValue) {
    super(String.format("%s no encontrada con %s : '%s'", resourceName, fieldName, fieldValue));
  }

  public ResourceNotFoundException(String message) {
    super(message);
  }
}
