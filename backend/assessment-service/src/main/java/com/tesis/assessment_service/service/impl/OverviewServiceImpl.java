package com.tesis.assessment_service.service.impl;

import com.tesis.assessment_service.dto.response.OverviewResponse;
import com.tesis.assessment_service.repository.AssessmentAssignmentRepository;
import com.tesis.assessment_service.repository.AssessmentSubmissionItemRepository;
import com.tesis.assessment_service.repository.AssessmentSubmissionRepository;
import com.tesis.assessment_service.service.OverviewService;
import com.tesis.assessment_service.service.client.ClassroomClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OverviewServiceImpl implements OverviewService {

  private final AssessmentAssignmentRepository assignmentRepo;
  private final AssessmentSubmissionRepository submissionRepo;
  private final AssessmentSubmissionItemRepository itemRepo;
  private final ClassroomClient classroomClient;

  @Override
  public OverviewResponse compute(UUID assignmentId) {
    var a = assignmentRepo.findById(assignmentId).orElseThrow();

    Integer totalStudents = null;
    if (a.getClassroomId() != null) {
      totalStudents = classroomClient.getStudentIds(a.getClassroomId()).size();
    }

    long started = submissionRepo.countByAssignment_Id(assignmentId);
    long submitted = submissionRepo.countByAssignment_IdAndStatus(assignmentId,
        com.tesis.assessment_service.model.enums.SubmissionStatus.SUBMITTED)
        + submissionRepo.countByAssignment_IdAndStatus(assignmentId,
            com.tesis.assessment_service.model.enums.SubmissionStatus.GRADED);

    Double avgNorm = submissionRepo.avgNormalizedScoreByAssignment(assignmentId);
    BigDecimal avgScore = (avgNorm == null)
        ? null
        : BigDecimal.valueOf(avgNorm * 100.0).setScale(2, RoundingMode.HALF_UP);

    long manualPending = itemRepo.countPendingManualItemsByAssignment(assignmentId,
        com.tesis.assessment_service.model.enums.GradingMode.MANUAL);

    List<AssessmentSubmissionItemRepository.ObjectiveAggRow> rows = itemRepo.aggregateByObjective(assignmentId);
    var breakdown = rows.stream().map(r -> {
      double avg = 0d;
      if (r.getSumPoints() != null && r.getSumPoints() > 0) {
        var sumScore = r.getSumScore() == null ? BigDecimal.ZERO : r.getSumScore();
        avg = sumScore.doubleValue() / r.getSumPoints().doubleValue(); // 0..1
      }
      return new OverviewResponse.ObjectiveBreakdown(r.getObjectiveId(), avg, r.getN().intValue());
    }).toList();

    return new OverviewResponse(
        a.getId(),
        a.getScope(),
        a.getClassroomId(),
        totalStudents,
        (int) started,
        (int) submitted,
        avgScore,
        breakdown,
        (int) manualPending);
  }
}
