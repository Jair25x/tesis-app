// src/main/java/com/tesis/progress_service/exception/InvalidAttemptException.java
package com.tesis.progress_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Se lanza cuando el payload del intento es incoherente con el currículo
 * oficial (IDs cruzados, etc.).
 */
public class InvalidAttemptException extends ResponseStatusException {

  public InvalidAttemptException(String reason) {
    super(HttpStatus.BAD_REQUEST, reason);
  }
}
