package com.tesis.gateway_service.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class FallbackController {

  @RequestMapping("/__fallback")
  @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
  public Map<String, Object> fallback() {
    return Map.of(
        "error", "service_unavailable",
        "message", "El servicio no está disponible temporalmente. Intenta de nuevo.");
  }
}
