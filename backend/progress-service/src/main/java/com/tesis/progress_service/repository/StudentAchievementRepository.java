package com.tesis.progress_service.repository;

import com.tesis.progress_service.dto.AchievementDto;
import com.tesis.progress_service.model.StudentAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface StudentAchievementRepository extends JpaRepository<StudentAchievement, UUID> {

  boolean existsByStudentIdAndAchievement_Id(UUID studentId, UUID achievementId);

  boolean existsByStudentIdAndAchievement_Code(UUID studentId, String code);

  @Query("""
    select new com.tesis.progress_service.dto.AchievementDto(
      a.code, a.name, a.description, sa.earnedAt
    )
    from StudentAchievement sa
    join sa.achievement a
    where sa.studentId = :studentId
    order by sa.earnedAt desc
  """)
  List<AchievementDto> findAllDtoByStudentIdOrderByEarnedAtDesc(UUID studentId);
}
