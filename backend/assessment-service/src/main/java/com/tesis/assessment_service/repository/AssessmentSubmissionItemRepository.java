package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentSubmissionItem;
import com.tesis.assessment_service.model.enums.GradingMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AssessmentSubmissionItemRepository extends JpaRepository<AssessmentSubmissionItem, UUID> {

  List<AssessmentSubmissionItem> findBySubmission_IdOrderByPositionAsc(UUID submissionId);

  @Query("""
      select count(i)
      from AssessmentSubmissionItem i
        join i.submission s
      where s.assignment.id = :assignmentId
        and i.gradingMode = :gradingMode
        and i.score is null
      """)
  long countPendingManualItemsByAssignment(UUID assignmentId, GradingMode gradingMode);

  @Query("""
      select i.objectiveId as objectiveId,
             sum(coalesce(i.score,0)) as sumScore,
             sum(i.points) as sumPoints,
             count(i) as n
      from AssessmentSubmissionItem i
        join i.submission s
      where s.assignment.id = :assignmentId
        and s.status in (com.tesis.assessment_service.model.enums.SubmissionStatus.SUBMITTED,
                         com.tesis.assessment_service.model.enums.SubmissionStatus.GRADED)
      group by i.objectiveId
      """)
  List<ObjectiveAggRow> aggregateByObjective(UUID assignmentId);

  interface ObjectiveAggRow {
    UUID getObjectiveId();

    java.math.BigDecimal getSumScore();

    Long getSumPoints();

    Long getN();
  }
}
