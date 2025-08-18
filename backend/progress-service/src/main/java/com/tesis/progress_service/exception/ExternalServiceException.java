// src/main/java/com/tesis/progress_service/exception/ExternalServiceException.java
package com.tesis.progress_service.exception;

public class ExternalServiceException extends RuntimeException {
  public ExternalServiceException(String message, Throwable cause) {
    super(message, cause);
  }

  public ExternalServiceException(String message) {
    super(message);
  }
}
