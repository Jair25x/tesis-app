package com.tesis.classroom_service.repository;

import com.tesis.classroom_service.model.JoinCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JoinCodeRepository extends JpaRepository<JoinCode, UUID> {

  Optional<JoinCode> findByCode(String code);

  /** Último código activo (no revocado) generado para un classroom */
  Optional<JoinCode> findFirstByClassroomIdAndRevokedFalseOrderByCreatedAtDesc(UUID classroomId);

  /**
   * Incremento atómico de usedCount, sólo si no está revocado, no expiró
   * y no se agotaron los usos (si maxUses no es null).
   * 
   * @return número de filas actualizadas (1 = éxito, 0 =
   *         agotado/expirado/revocado)
   *
   *         Nota: este UPDATE en bloque no actualiza updatedAt de
   *         AuditableEntity,
   *         lo manejamos a nivel de negocio si fuera necesario.
   */
  @Modifying
  @Query("""
        update JoinCode j
           set j.usedCount = j.usedCount + 1
         where j.id = :id
           and (j.maxUses is null or j.usedCount < j.maxUses)
           and j.revoked = false
           and j.expiresAt > :now
      """)
  int tryConsume(@Param("id") UUID id, @Param("now") Instant now);
  
}
