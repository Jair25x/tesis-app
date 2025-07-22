// src/main/java/com/tesis/curriculum_service/config/JpaAuditingConfig.java
package com.tesis.curriculum_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import com.tesis.curriculum_service.util.SecurityUtils;


@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class JpaAuditingConfig {

  /**
   * AuditorAware que usa el usuario actual del SecurityContext.
   */
  @Bean
  public AuditorAware<String> auditorAware() {
    return SecurityUtils::getCurrentUsername;
  }
}
