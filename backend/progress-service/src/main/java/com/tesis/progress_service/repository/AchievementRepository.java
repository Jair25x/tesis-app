package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.Achievement;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

  Optional<Achievement> findByCode(String code);

  List<Achievement> findAllByActiveTrue();

  // Útil si tu entidad tiene "active". Si no lo tiene, no lo uses desde el
  // servicio.
  List<Achievement> findByActiveTrue(Sort sort);
}
