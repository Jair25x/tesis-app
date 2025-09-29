// src/main/java/com/tesis/progress_service/config/DataInitializer.java
package com.tesis.progress_service.config;

import com.tesis.progress_service.model.Achievement;
import com.tesis.progress_service.repository.AchievementRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile({ "dev" })
@RequiredArgsConstructor
public class DataInitializer {

  private final AchievementRepository achievementRepository;

  @PostConstruct
  @Transactional
  public void init() {
    // Existentes
    seed("FIRST_TRY", "¡A la primera!", "Responde un ejercicio correctamente en el primer intento", 10);
    seed("FIVE_IN_ROW", "Racha de aciertos x5", "Obtén 5 aciertos consecutivos", 25);
    seed("DAILY_STARTER", "Comenzó el día", "Completa tu primer intento del día", 5);

    // Nuevos (Duelos)
    seed("DUEL_FIRST_WIN", "¡Primera victoria en duelo!", "Gana tu primer duelo", 50);
    seed("DUEL_FAST_ANSWER", "Rápido como un rayo", "Responde bien en ≤ 5s en un duelo", 30);
    seed("DUEL_BEST_OF_THREE_WINNER", "Rey del BO3", "Gana un duelo al mejor de 3", 80);

    long total = achievementRepository.count();
    System.out.println("✅ Achievements seed OK: total=" + total);
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
