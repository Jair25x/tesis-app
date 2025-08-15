package com.tesis.progress_service.config;

import com.tesis.progress_service.model.Achievement;
import com.tesis.progress_service.repository.AchievementRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Profile({ "dev" })
@RequiredArgsConstructor
public class DataInitializer {

  private final AchievementRepository achievementRepository;

  @PostConstruct
  @Transactional
  public void init() {
    seedAchievement("FIRST_TRY", "¡A la primera!", "Responde un ejercicio correctamente en el primer intento", 10);
    seedAchievement("FIVE_IN_ROW", "Racha de aciertos x5", "Obtén 5 aciertos consecutivos", 25);
    seedAchievement("DAILY_STARTER", "Comenzó el día", "Completa tu primer intento del día", 5);
    long total = achievementRepository.count();
    System.out.println("✅ Achievements seed OK: total=" + total);
  }

  private void seedAchievement(String code, String name, String description, int points) {
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
