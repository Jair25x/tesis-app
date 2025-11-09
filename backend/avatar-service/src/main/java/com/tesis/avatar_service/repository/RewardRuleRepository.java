package com.tesis.avatar_service.repository;

import com.tesis.avatar_service.model.RewardRule;
import com.tesis.avatar_service.model.RewardSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RewardRuleRepository extends JpaRepository<RewardRule, UUID> {

  @Query(value = """
      SELECT * FROM reward_rule
       WHERE active = true
         AND source = :source::reward_source
         AND trigger_code = :triggerCode
      """, nativeQuery = true)
  Optional<RewardRule> findActiveBySourceAndTrigger(@Param("source") String source,
                                                    @Param("triggerCode") String triggerCode);

  // (Opcional) Si quieres validar max_claims por alumno, puedes contar en inventory
  // con (student_id, source, trigger_code) si registras ese trigger en award_code.
}
