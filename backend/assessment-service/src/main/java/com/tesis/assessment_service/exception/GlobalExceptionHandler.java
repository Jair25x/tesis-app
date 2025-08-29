package com.tesis.assessment_service.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  private String traceId() {
    // Si usas MDC/observabilidad, podrías extraer un traceId (por ejemplo,
    // MDC.get("traceId"))
    return null;
  }

  private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, HttpServletRequest req,
      Map<String, Object> details) {
    ErrorResponse body = new ErrorResponse(
        status.value(), status.getReasonPhrase(), message,
        req != null ? req.getRequestURI() : null,
        traceId(),
        details);
    return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON).body(body);
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, HttpServletRequest req) {
    return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req, null);
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ErrorResponse> handleForbidden(ForbiddenException ex, HttpServletRequest req) {
    return build(HttpStatus.FORBIDDEN, ex.getMessage(), req, null);
  }

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex, HttpServletRequest req) {
    return build(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex, HttpServletRequest req) {
    return build(HttpStatus.CONFLICT, ex.getMessage(), req, null);
  }

  /**
   * Mapea fallas de servicios externos a 502/503 para diferenciar permisos vs
   * indisponibilidad.
   * - statusCode == 0 => sin respuesta/timeout/red => 503
   * - statusCode >= 500 => error upstream => 502
   * - otros => 502 (inconsistencias de orquestación)
   */
  @ExceptionHandler(ExternalServiceException.class)
  public ResponseEntity<ErrorResponse> handleExternal(ExternalServiceException ex, HttpServletRequest req) {
    int upstream = ex.getStatusCode();
    HttpStatus status = (upstream == 0) ? HttpStatus.SERVICE_UNAVAILABLE
        : (upstream >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_GATEWAY);

    Map<String, Object> details = new HashMap<>();
    details.put("service", ex.getServiceName());
    details.put("upstreamStatus", upstream);

    String msg = ex.getMessage() != null
        ? ex.getMessage()
        : "Fallo en servicio externo [" + ex.getServiceName() + "]";

    // WARN para reducir ruido: no es bug del servicio, pero afecta el resultado
    log.warn("ExternalServiceException: status={} upstream={} service={} msg={}",
        status.value(), upstream, ex.getServiceName(), msg);

    return build(status, msg, req, details);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
    Map<String, Object> details = new HashMap<>();
    details.put("fields", ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.toMap(
            fe -> fe.getField(),
            fe -> fe.getDefaultMessage(),
            (a, b) -> b)));
    return build(HttpStatus.BAD_REQUEST, "Validación fallida", req, details);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex, HttpServletRequest req) {
    Map<String, Object> details = Map.of(
        "violations", ex.getConstraintViolations().stream()
            .map(v -> v.getPropertyPath() + ": " + v.getMessage()).toList());
    return build(HttpStatus.BAD_REQUEST, "Restricciones inválidas", req, details);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex,
      HttpServletRequest req) {
    return build(HttpStatus.BAD_REQUEST, "Tipo de argumento inválido: " + ex.getMessage(), req, null);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
    return build(HttpStatus.CONFLICT, "Violación de integridad de datos", req, null);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleRse(ResponseStatusException ex, HttpServletRequest req) {
    HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
    if (status == null)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    String msg = ex.getReason() != null ? ex.getReason() : "Error";
    return build(status, msg, req, null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest req) {
    log.error("Error no controlado", ex);
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno", req, null);
  }

  @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
  public ResponseEntity<ErrorResponse> handleMethodNotSupported(
      org.springframework.web.HttpRequestMethodNotSupportedException ex,
      jakarta.servlet.http.HttpServletRequest request) {

    String path = request != null ? request.getRequestURI() : null;
    String traceId = org.slf4j.MDC.get("traceId"); // si usas MDC; de lo contrario deja null
    Map<String, Object> details = new HashMap<>();
    if (ex.getSupportedHttpMethods() != null) {
      details.put("supported", ex.getSupportedHttpMethods().toString());
    }

    ErrorResponse err = new ErrorResponse(
        405,
        "Method Not Allowed",
        ex.getMessage(),
        path,
        traceId,
        details.isEmpty() ? null : details);

    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(err);
  }
}
