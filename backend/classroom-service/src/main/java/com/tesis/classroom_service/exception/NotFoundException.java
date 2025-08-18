package com.tesis.classroom_service.exception;

public class NotFoundException extends RuntimeException {

  private final String resource;
  private final String field;
  private final Object value;

  public NotFoundException(String message) {
    super(message);
    this.resource = null;
    this.field = null;
    this.value = null;
  }

  public NotFoundException(String resource, String field, Object value) {
    super(resource + " no encontrado: " + field + "=" + value);
    this.resource = resource;
    this.field = field;
    this.value = value;
  }

  public String getResource() {
    return resource;
  }

  public String getField() {
    return field;
  }

  public Object getValue() {
    return value;
  }
}
