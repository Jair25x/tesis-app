package com.tesis.assessment_service.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
  private final OffsetDateTime timestamp = OffsetDateTime.now();
  private final int status;
  private final String error;
  private final String message;
  private final String path;
  private final String traceId;
  private final Map<String, Object> details;

  public ErrorResponse(int status, String error, String message, String path, String traceId,
      Map<String, Object> details) {
    this.status = status;
    this.error = error;
    this.message = message;
    this.path = path;
    this.traceId = traceId;
    this.details = details;
  }

  public OffsetDateTime getTimestamp() {
    return timestamp;
  }

  public int getStatus() {
    return status;
  }

  public String getError() {
    return error;
  }

  public String getMessage() {
    return message;
  }

  public String getPath() {
    return path;
  }

  public String getTraceId() {
    return traceId;
  }

  public Map<String, Object> getDetails() {
    return details;
  }
}
