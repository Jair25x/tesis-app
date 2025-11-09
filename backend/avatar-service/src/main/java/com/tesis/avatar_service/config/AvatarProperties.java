package com.tesis.avatar_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Se llena desde Config Server. Ejemplo:
 *
 * avatar:
 *   rewards:
 *     map:
 *       "ACHIEVEMENT:STREAK_3D": "HAT_RED_CAP"
 *       "ACHIEVEMENT:FIRST_CORRECT": "FACE_STAR_CHEEKS"
 */
@Data
@Component
@ConfigurationProperties(prefix = "avatar")
public class AvatarProperties {

  private Rewards rewards = new Rewards();

  @Data
  public static class Rewards {
    /**
     * Mapa fallback de reglas logro->code de cosmetic_item
     * key esperado: "<SOURCE>:<TRIGGER_CODE>" (p. ej. "ACHIEVEMENT:STREAK_3D")
     * value: code del cosmetic_item (p. ej. "HAT_RED_CAP")
     */
    private Map<String, String> map;
  }
}
