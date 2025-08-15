package com.tesis.progress_service.exception;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /* 404 de dominio */
  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
    log.warn("NotFound: {}", ex.getMessage());
    return build(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  /* 400 por payload inválido (DTOs @Valid) */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String msg = ex.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField() + ": " + (fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "inválido"))
        .collect(Collectors.joining("; "));
    log.warn("Validation error: {}", msg);
    return build(HttpStatus.BAD_REQUEST, msg.isBlank() ? "Datos inválidos" : msg);
  }

  /* 400 por validaciones tipo @Min, @NotNull en @RequestParam, etc. */
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex) {
    String msg = ex.getConstraintViolations().stream()
        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
        .collect(Collectors.joining("; "));
    log.warn("Constraint violation: {}", msg);
    return build(HttpStatus.BAD_REQUEST, msg.isBlank() ? "Solicitud inválida" : msg);
  }

  /* 400 por JSON malformado o tipos incorrectos */
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleNotReadable(HttpMessageNotReadableException ex) {
    log.warn("Malformed JSON: {}", ex.getMessage());
    return build(HttpStatus.BAD_REQUEST, "Cuerpo de la petición inválido o malformado");
  }

  /* 403 de Spring Security */
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    log.warn("Access denied: {}", ex.getMessage());
    return build(HttpStatus.FORBIDDEN, "Acceso denegado");
  }

  /* 400 genérico para argumentos ilegales en negocio */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArg(IllegalArgumentException ex) {
    log.warn("Illegal argument: {}", ex.getMessage());
    return build(HttpStatus.BAD_REQUEST, ex.getMessage() != null ? ex.getMessage() : "Solicitud inválida");
  }

  /* 500 fallback: cualquier otra excepción no controlada */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
    log.error("Unexpected error", ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
  }

  private ResponseEntity<ErrorResponse> build(HttpStatus status, String msg) {
    ErrorResponse body = ErrorResponse.builder()
        .message(msg)
        .status(status.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(status).body(body);
  }
}
