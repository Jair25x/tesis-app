package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentAssignment;
import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AssessmentAssignmentRepository
    extends JpaRepository<AssessmentAssignment, UUID>, JpaSpecificationExecutor<AssessmentAssignment> {

  Page<AssessmentAssignment> findByScopeAndState(AssignmentScope scope, AssignmentState state, Pageable pageable);

  List<AssessmentAssignment> findByTemplate_Id(UUID templateId);

  /** Activas dentro de ventana (uso general). */
  Page<AssessmentAssignment> findByStateAndWindowStartBeforeAndWindowEndAfter(
      AssignmentState state,
      OffsetDateTime before,
      OffsetDateTime after,
      Pageable pageable);
}
