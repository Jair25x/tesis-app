// src/main/java/com/tesis/progress_service/exception/GlobalExceptionHandler.java
package com.tesis.progress_service.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  // 503 para fallos del servicio externo (fallback del Circuit Breaker)
  @ExceptionHandler(ExternalServiceException.class)
  public ResponseEntity<ErrorResponse> handleExternal(ExternalServiceException ex) {
    var err = ErrorResponse.builder()
        .message(ex.getMessage() != null ? ex.getMessage() : "Servicio externo no disponible")
        .status(HttpStatus.SERVICE_UNAVAILABLE.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(err);
  }

  // 🔴 IMPORTANTE: preserva el status original (4xx/5xx) de
  // ResponseStatusException
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
    var status = ex.getStatusCode();
    var err = ErrorResponse.builder()
        .message(ex.getReason() != null ? ex.getReason() : "Solicitud inválida")
        .status(status.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(status).body(err);
  }

  // 404 propio
  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
    var err = ErrorResponse.builder()
        .message(ex.getMessage() != null ? ex.getMessage() : "Recurso no encontrado")
        .status(HttpStatus.NOT_FOUND.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
  }

  // 400 por validaciones @Valid
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String msg = ex.getBindingResult().getFieldErrors().stream()
        .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
        .findFirst()
        .orElse("Datos inválidos");
    var err = ErrorResponse.builder()
        .message(msg)
        .status(HttpStatus.BAD_REQUEST.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.badRequest().body(err);
  }

  // 400 si el JSON está mal formado o faltan tipos correctos
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
    var err = ErrorResponse.builder()
        .message("Cuerpo JSON inválido o malformado")
        .status(HttpStatus.BAD_REQUEST.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.badRequest().body(err);
  }

  // 400 por tipos de parámetros incorrectos (UUID mal formado, etc.)
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
    var err = ErrorResponse.builder()
        .message("Parámetro inválido: " + ex.getName())
        .status(HttpStatus.BAD_REQUEST.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.badRequest().body(err);
  }

  // 401 no autenticado (útil si llega directo sin gateway)
  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuth(AuthenticationException ex) {
    var err = ErrorResponse.builder()
        .message("No autenticado")
        .status(HttpStatus.UNAUTHORIZED.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
  }

  // 403 acceso denegado
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccess(AccessDeniedException ex) {
    var err = ErrorResponse.builder()
        .message("Acceso denegado")
        .status(HttpStatus.FORBIDDEN.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
  }

  // Catch-all final (mantener al final)
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
    // Logea con stacktrace para troubleshooting en prod
    log.error("Error no controlado", ex);
    var err = ErrorResponse.builder()
        .message("Error interno")
        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .timestamp(System.currentTimeMillis())
        .build();
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
  }
}
