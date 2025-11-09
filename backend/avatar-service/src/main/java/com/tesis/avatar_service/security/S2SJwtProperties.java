package com.tesis.avatar_service.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "s2s.jwt")
@Getter
@Setter
public class S2SJwtProperties {
  private String secret;
}
