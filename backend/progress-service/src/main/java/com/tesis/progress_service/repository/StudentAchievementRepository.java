// src/main/java/com/tesis/progress_service/repository/StudentAchievementRepository.java
package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.StudentAchievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentAchievementRepository extends JpaRepository<StudentAchievement, UUID> {
  boolean existsByStudentIdAndAchievement_Id(UUID studentId, UUID achievementId);

  List<StudentAchievement> findAllByStudentIdOrderByEarnedAtDesc(UUID studentId);
}
