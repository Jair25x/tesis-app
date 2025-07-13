// src/main/java/com/tesis/curriculum_service/config/TemplateConfig.java
package com.tesis.curriculum_service.config;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.MustacheFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de plantillas Mustache para
 * generar enunciados dinámicos de ejercicios.
 */
@Configuration
public class TemplateConfig {

  /**
   * MustacheFactory permitirá compilar y ejecutar
   * plantillas Mustache a partir de cadenas/patterns.
   */
  @Bean
  public MustacheFactory mustacheFactory() {
    return new DefaultMustacheFactory();
  }
}
