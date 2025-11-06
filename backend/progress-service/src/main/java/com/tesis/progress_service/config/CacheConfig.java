package com.tesis.progress_service.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

/**
 * Configuración única de caché para el servicio.
 * - Evita duplicación con YAML (no declares spring.cache.* en config-repo para este servicio).
 * - Habilita recordStats() para que Micrometer exponga métricas (hits, misses, evictions, size).
 * - TTL y máximo tamaño conservadores para prod; ajusta según tráfico real.
 */
@Configuration
public class CacheConfig {

  @Bean
  public CacheManager cacheManager() {
    var achievementCatalog = new CaffeineCache(
        "achievementCatalog",
        Caffeine.newBuilder()
            .maximumSize(500)                         // evita crecimiento infinito
            .expireAfterWrite(Duration.ofMinutes(10)) // TTL razonable para catálogo
            .recordStats()                            // <-- necesario para métricas Micrometer
            .build()
    );

    var manager = new SimpleCacheManager();
    manager.setCaches(List.of(achievementCatalog));
    return manager;
  }
}
