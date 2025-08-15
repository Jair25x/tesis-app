// src/main/java/com/tesis/progress_service/repository/StreakRepository.java
package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.Streak;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StreakRepository extends JpaRepository<Streak, UUID> {
  Optional<Streak> findByStudentId(UUID studentId);
}
