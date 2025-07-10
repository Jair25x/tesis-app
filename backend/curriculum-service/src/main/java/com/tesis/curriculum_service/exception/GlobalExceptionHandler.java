package com.tesis.curriculum_service.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import jakarta.validation.ConstraintViolationException; // Asegúrate de tener esta importación si la usas

import java.util.HashMap;
import java.util.Map;

/**
 * Manejador de excepciones global para la aplicación Spring Boot.
 * Esta clase centraliza el manejo de diversas excepciones, traduciéndolas
 * en respuestas HTTP consistentes y amigables para el cliente.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /**
   * Maneja la excepción {@link ResourceNotFoundException}.
   * Devuelve un estado HTTP 404 Not Found.
   *
   * @param ex      La excepción ResourceNotFoundException.
   * @param request La petición web actual.
   * @return Una ResponseEntity con el DTO ErrorResponse y el estado 404.
   */
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex,
      WebRequest request) {
    logger.error("ResourceNotFoundException: {}", ex.getMessage());
    ErrorResponse errorResponse = new ErrorResponse(
        ex.getMessage(),
        HttpStatus.NOT_FOUND.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
  }

  /**
   * Maneja la excepción {@link IllegalArgumentException}.
   * Devuelve un estado HTTP 400 Bad Request o 409 Conflict dependiendo del
   * mensaje.
   * Esto es una mejora, pero para este proyecto, principalmente se usará 400/409.
   *
   * @param ex      La excepción IllegalArgumentException.
   * @param request La petición web actual.
   * @return Una ResponseEntity con el DTO ErrorResponse y el estado apropiado
   *         (400/409).
   */
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
    logger.error("IllegalArgumentException: {}", ex.getMessage());
    HttpStatus status = HttpStatus.BAD_REQUEST;
    if (ex.getMessage() != null && ex.getMessage().contains("Ya existe")) {
      status = HttpStatus.CONFLICT;
    }
    ErrorResponse errorResponse = new ErrorResponse(
        ex.getMessage(),
        status.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, status);
  }

  /**
   * Maneja la excepción {@link MethodArgumentNotValidException} que ocurre cuando
   * falla la validación de los DTOs de entrada (@Valid).
   * Devuelve un estado HTTP 400 Bad Request con detalles de los errores de
   * validación.
   *
   * @param ex      La excepción MethodArgumentNotValidException.
   * @param request La petición web actual.
   * @return Una ResponseEntity con el DTO ErrorResponse y el estado 400.
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex,
      WebRequest request) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> {
      errors.put(error.getField(), error.getDefaultMessage());
    });

    String errorMessage = "Validation failed: " + errors.toString();
    logger.error("Validation Error: {}", errorMessage);

    ErrorResponse errorResponse = new ErrorResponse(
        errorMessage,
        HttpStatus.BAD_REQUEST.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  // Manejador para fallos de conversión de tipo de argumento de método
  // (PathVariable, RequestParam)
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex,
      WebRequest request) {
    String errorMessage = String.format(
        "El argumento '%s' con valor '%s' no pudo ser convertido al tipo requerido '%s'.",
        ex.getName(), ex.getValue(),
        ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconocido");
    logger.error("MethodArgumentTypeMismatchException: {}", errorMessage, ex);
    ErrorResponse errorResponse = new ErrorResponse(
        errorMessage,
        HttpStatus.BAD_REQUEST.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  // Opcional: Manejador para ConstraintViolationException si usas @Validated en
  // @Controller y validaciones en @PathVariable/RequestParam
  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex,
      WebRequest request) {
    String errorMessage = "Constraint violation: " + ex.getMessage();
    logger.error("ConstraintViolationException: {}", errorMessage, ex);
    ErrorResponse errorResponse = new ErrorResponse(
        errorMessage,
        HttpStatus.BAD_REQUEST.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  // Manejador para excepciones de autenticación (ej. token JWT inválido/expirado,
  // o no se presenta cuando se requiere autenticación)
  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
    logger.error("Authentication Error: {}", ex.getMessage(), ex);
    ErrorResponse errorResponse = new ErrorResponse(
        "Fallo de autenticación: " + ex.getMessage(),
        HttpStatus.UNAUTHORIZED.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  // Manejador para excepciones de acceso denegado (usuario autenticado pero sin
  // permisos suficientes)
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
    logger.error("Access Denied Error: {}", ex.getMessage(), ex);
    ErrorResponse errorResponse = new ErrorResponse(
        "Acceso denegado: " + ex.getMessage(),
        HttpStatus.FORBIDDEN.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
  }

  /**
   * Maneja cualquier otra excepción no especificada.
   * Devuelve un estado HTTP 500 Internal Server Error.
   *
   * @param ex      La excepción no manejada.
   * @param request La petición web actual.
   * @return Una ResponseEntity con el DTO ErrorResponse y el estado 500.
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
    logger.error("Internal Server Error: {}", ex.getMessage(), ex);
    ErrorResponse errorResponse = new ErrorResponse(
        "Ocurrió un error interno del servidor.",
        HttpStatus.INTERNAL_SERVER_ERROR.value(),
        System.currentTimeMillis());
    return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
