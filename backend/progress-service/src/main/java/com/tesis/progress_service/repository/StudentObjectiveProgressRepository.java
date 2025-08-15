// src/main/java/com/tesis/progress_service/repository/StudentObjectiveProgressRepository.java
package com.tesis.progress_service.repository;

import com.tesis.progress_service.model.StudentObjectiveProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

import java.util.UUID;

public interface StudentObjectiveProgressRepository extends JpaRepository<StudentObjectiveProgress, UUID> {

  Optional<StudentObjectiveProgress> findByStudentIdAndLearningObjectiveId(UUID studentId, UUID learningObjectiveId);

  List<StudentObjectiveProgress> findAllByStudentId(UUID studentId);

  List<StudentObjectiveProgress> findAllByStudentIdAndCurriculumId(UUID studentId, UUID curriculumId);
}
