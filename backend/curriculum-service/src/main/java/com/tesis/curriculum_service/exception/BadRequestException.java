// src/main/java/com/tesis/curriculum_service/exception/BadRequestException.java
package com.tesis.curriculum_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Excepción para errores de validación o parámetros inválidos.
 * Se traduce a HTTP 400 Bad Request.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
  public BadRequestException(String message) {
    super(message);
  }
}
