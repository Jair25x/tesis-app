package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentProgressOutbox;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AssessmentProgressOutboxRepository extends JpaRepository<AssessmentProgressOutbox, UUID> {

  List<AssessmentProgressOutbox> findTop100ByStatusOrderByCreatedAtAsc(OutboxStatus status);

  @Query(value = """
          SELECT o FROM AssessmentProgressOutbox o
           WHERE o.status IN (com.tesis.assessment_service.model.enums.OutboxStatus.PENDING,
                              com.tesis.assessment_service.model.enums.OutboxStatus.FAILED)
           ORDER BY o.createdAt ASC
      """)
  List<AssessmentProgressOutbox> findTopNPendingOrFailed(org.springframework.data.domain.Pageable pageable);

  default List<AssessmentProgressOutbox> findTopNPendingOrFailed(int limit) {
    return findTopNPendingOrFailed(org.springframework.data.domain.PageRequest.of(0, limit));
  }
}
