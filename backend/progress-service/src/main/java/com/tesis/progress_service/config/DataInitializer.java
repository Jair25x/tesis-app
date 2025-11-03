// src/main/java/com/tesis/progress_service/config/DataInitializer.java
package com.tesis.progress_service.config;

import com.tesis.progress_service.model.Achievement;
import com.tesis.progress_service.repository.AchievementRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile({"dev"}) // Solo en dev
@RequiredArgsConstructor
public class DataInitializer {

  private final AchievementRepository achievementRepository;

  @Value("${app.seed.enabled:false}")
  private boolean seedEnabled;

  @PostConstruct
  @Transactional
  public void init() {
    if (!seedEnabled) {
      System.out.println("ℹ️ app.seed.enabled=false → DataInitializer deshabilitado (progress-service).");
      return;
    }

    // Semillas locales (útiles si trabajas sin Flyway o quieres data extra para demos).
    seed("FIRST_TRY", "¡A la primera!", "Responde un ejercicio correctamente en el primer intento", 10);
    seed("FIVE_IN_ROW", "Racha de aciertos x5", "Obtén 5 aciertos consecutivos", 25);
    seed("DAILY_STARTER", "Comenzó el día", "Completa tu primer intento del día", 5);
    seed("DUEL_FIRST_WIN", "¡Primera victoria en duelo!", "Gana tu primer duelo", 50);
    seed("DUEL_FAST_ANSWER", "Rápido como un rayo", "Responde bien en ≤ 5s en un duelo", 30);
    seed("DUEL_BEST_OF_THREE_WINNER", "Rey del BO3", "Gana un duelo al mejor de 3", 80);

    long total = achievementRepository.count();
    System.out.println("✅ Achievements DataInitializer OK: total=" + total);
  }

  private void seed(String code, String name, String description, int points) {
    achievementRepository.findByCode(code).orElseGet(() -> {
      Achievement a = Achievement.builder()
          .code(code)
          .name(name)
          .description(description)
          .points(points)
          .active(true)
          .build();
      return achievementRepository.save(a);
    });
  }
}
