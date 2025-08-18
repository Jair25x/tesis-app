// src/main/java/com/tesis/classroom_service/security/JwtProperties.java
package com.tesis.classroom_service.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {
  /** Base64 secret compartido con gateway y auth-service */
  private String secretKey;
  private long expirationMs; // opcional aquí
  private long refreshExpirationMs; // opcional aquí
}
