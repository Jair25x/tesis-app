// src/main/java/com/tesis/curriculum_service/exception/GlobalExceptionHandler.java
package com.tesis.curriculum_service.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador de excepciones global para estandarizar respuestas de error.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> onNotFound(ResourceNotFoundException ex) {
    logger.error("Not Found: {}", ex.getMessage());
    return buildError(ex.getMessage(), HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ErrorResponse> onBadRequest(BadRequestException ex) {
    logger.error("Bad Request: {}", ex.getMessage());
    return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> onIllegalArg(IllegalArgumentException ex) {
    logger.error("Illegal Argument: {}", ex.getMessage());
    return buildError(ex.getMessage(), HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> onValidation(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors()
        .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
    String msg = "Validation failed: " + errors;
    logger.error("Validation Error: {}", msg);
    return buildError(msg, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> onTypeMismatch(MethodArgumentTypeMismatchException ex) {
    String msg = String.format(
        "Argument '%s' with value '%s' cannot be converted to %s",
        ex.getName(), ex.getValue(),
        ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
    logger.error("Type Mismatch: {}", msg);
    return buildError(msg, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ErrorResponse> onConstraintViolation(ConstraintViolationException ex) {
    String msg = "Constraint violation: " + ex.getMessage();
    logger.error("Constraint Violation: {}", msg);
    return buildError(msg, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> onAuthError(AuthenticationException ex) {
    logger.error("Authentication Error: {}", ex.getMessage());
    return buildError("Fallo de autenticación: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> onAccessDenied(AccessDeniedException ex) {
    logger.error("Access Denied: {}", ex.getMessage());
    return buildError("Acceso denegado: " + ex.getMessage(), HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> onAny(Exception ex) {
    logger.error("Internal Error: {}", ex.getMessage(), ex);
    return buildError("Error interno del servidor.", HttpStatus.INTERNAL_SERVER_ERROR);
  }

  // helper
  private ResponseEntity<ErrorResponse> buildError(String message, HttpStatus status) {
    ErrorResponse body = new ErrorResponse(message, status.value(), System.currentTimeMillis());
    return new ResponseEntity<>(body, status);
  }
}
