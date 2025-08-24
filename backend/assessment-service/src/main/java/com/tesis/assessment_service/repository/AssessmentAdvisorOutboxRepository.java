package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentAdvisorOutbox;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AssessmentAdvisorOutboxRepository extends JpaRepository<AssessmentAdvisorOutbox, UUID> {

  @Query("""
        SELECT o FROM AssessmentAdvisorOutbox o
         WHERE o.status IN (com.tesis.assessment_service.model.enums.OutboxStatus.PENDING,
                            com.tesis.assessment_service.model.enums.OutboxStatus.FAILED)
         ORDER BY o.createdAt ASC
      """)
  List<AssessmentAdvisorOutbox> findTopNPendingOrFailed(org.springframework.data.domain.Pageable pageable);

  default List<AssessmentAdvisorOutbox> findTopNPendingOrFailed(int limit) {
    return findTopNPendingOrFailed(PageRequest.of(0, limit));
  }
}
