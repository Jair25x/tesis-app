package com.tesis.avatar_service.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
public class CacheConfig {

  public static final String AVATAR_CATALOG = "avatarCatalog";

  @Bean
  public CacheManager cacheManager() {
    SimpleCacheManager manager = new SimpleCacheManager();
    CaffeineCache catalog = new CaffeineCache(
        AVATAR_CATALOG,
        Caffeine.newBuilder()
            .maximumSize(1000)
            .recordStats()
            .expireAfterWrite(Duration.ofMinutes(30))
            .build());
    manager.setCaches(List.of(catalog));
    return manager;
  }
}
