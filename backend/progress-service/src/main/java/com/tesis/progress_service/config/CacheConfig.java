package com.tesis.progress_service.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

/**
 * Configuración única de caché (Caffeine).
 * - No dupliques con spring.cache.* en YAML para este servicio.
 * - recordStats(): Micrometer expondrá hits/misses/evictions/size.
 */
@Configuration
@EnableCaching
public class CacheConfig {

  @Bean
  public CacheManager cacheManager() {
    var achievementCatalog = new CaffeineCache(
        "achievementCatalog",
        Caffeine.newBuilder()
            .maximumSize(500) // evita crecimiento infinito
            .expireAfterWrite(Duration.ofMinutes(10)) // TTL razonable
            .recordStats() // expone métricas cache.*
            .build());

    var manager = new SimpleCacheManager();
    manager.setCaches(List.of(achievementCatalog));
    return manager;
  }
}
