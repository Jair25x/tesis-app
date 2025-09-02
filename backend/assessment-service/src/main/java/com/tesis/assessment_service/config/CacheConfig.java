package com.tesis.assessment_service.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.UUID;

@Configuration
public class CacheConfig {

  @Bean("classroomNameCache")
  public Cache<UUID, String> classroomNameCache() {
    return Caffeine.newBuilder()
        .maximumSize(1000) // ajusta si lo necesitas
        .expireAfterWrite(Duration.ofMinutes(10)) // TTL
        .recordStats()
        .build();
  }
}
