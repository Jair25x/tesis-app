package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

import java.util.UUID;

public interface AchievementRepository extends JpaRepository<Achievement, UUID> {

  Optional<Achievement> findByCode(String code);

  List<Achievement> findAllByActiveTrue();
}
