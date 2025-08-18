package com.tesis.classroom_service.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  private static ErrorResponse build(HttpStatus status, String message) {
    return ErrorResponse.builder()
        .message(message)
        .status(status.value())
        .timestamp(System.currentTimeMillis())
        .build();
  }

  // --- Errores de dominio propios ---
  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex) {
    return ResponseEntity.badRequest().body(build(HttpStatus.BAD_REQUEST, ex.getMessage()));
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(build(HttpStatus.FORBIDDEN, ex.getMessage()));
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(build(HttpStatus.NOT_FOUND, ex.getMessage()));
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(build(HttpStatus.CONFLICT, ex.getMessage()));
  }

  // --- Errores de validación ---
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String msg = ex.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
        .findFirst()
        .orElse("Datos inválidos");
    return ResponseEntity.badRequest().body(build(HttpStatus.BAD_REQUEST, msg));
  }

  // --- Seguridad (Spring Security) ---
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(build(HttpStatus.FORBIDDEN, "Acceso denegado"));
  }

  // --- Mapeo directo de ResponseStatusException (si se usa en algún punto) ---
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
    HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
    if (status == null)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    String msg = (ex.getReason() != null ? ex.getReason() : "Error");
    return ResponseEntity.status(status).body(build(status, msg));
  }

  // --- Integridad de datos (FK/UK/longitud, etc.) ---
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
    log.warn("Violación de integridad de datos: {}", ex.getMostSpecificCause() != null
        ? ex.getMostSpecificCause().getMessage()
        : ex.getMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(build(HttpStatus.CONFLICT, "Conflicto de datos (restricciones de base de datos)"));
  }

  // --- Fallback genérico ---
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
    log.error("Error no controlado", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno"));
  }
}
