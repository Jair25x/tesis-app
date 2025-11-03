// src/main/java/com/tesis/common/config/CacheConfig.java
package com.tesis.auth_service.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.annotation.EnableCaching;

@Configuration
@EnableCaching
public class CacheConfig {

  @Bean
  public CacheManager cacheManager() {
    CaffeineCacheManager cm = new CaffeineCacheManager();
    cm.setCaffeine(Caffeine.newBuilder()
        .maximumSize(2048)
        .expireAfterWrite(Duration.ofMinutes(5)));
    return cm;
  }
}
