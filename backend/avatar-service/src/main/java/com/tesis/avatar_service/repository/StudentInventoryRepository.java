package com.tesis.avatar_service.repository;

import com.tesis.avatar_service.model.RewardSource;
import com.tesis.avatar_service.model.StudentInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentInventoryRepository extends JpaRepository<StudentInventory, UUID> {

  // Inventario del alumno (join item) ordenado por fecha de entrega
  interface InventoryRow {
    UUID getId();
    UUID getStudentId();
    String getSource();      // RewardSource
    String getAwardCode();
    java.time.Instant getAwardedAt();

    // Campos del item
    UUID getItemId();
    String getItemCode();
    String getDisplayName();
    String getSlot();
    String getRarity();
    String getAssetUrl();
  }

  @Query(value = """
      SELECT si.id as id,
             si.student_id as studentId,
             si.source::text as source,
             si.award_code as awardCode,
             si.awarded_at as awardedAt,
             ci.id as itemId,
             ci.code as itemCode,
             ci.display_name as displayName,
             ci.slot::text as slot,
             ci.rarity as rarity,
             ci.asset_url as assetUrl
        FROM student_inventory si
        JOIN cosmetic_item ci ON ci.id = si.cosmetic_item_id
       WHERE si.student_id = :studentId
       ORDER BY si.awarded_at DESC
      """, nativeQuery = true)
  List<InventoryRow> findInventoryByStudent(@Param("studentId") UUID studentId);

  // Verificar ownership (para equipar)
  @Query(value = """
      SELECT COUNT(*) > 0
        FROM student_inventory
       WHERE student_id = :studentId
         AND cosmetic_item_id = :itemId
      """, nativeQuery = true)
  boolean existsOwnership(@Param("studentId") UUID studentId, @Param("itemId") UUID itemId);

  // Buscar registro idempotente
  @Query(value = """
      SELECT * FROM student_inventory
       WHERE student_id = :studentId
         AND source = :source::reward_source
         AND award_code = :awardCode
      """, nativeQuery = true)
  Optional<StudentInventory> findIdempotent(@Param("studentId") UUID studentId,
                                            @Param("source") String source,
                                            @Param("awardCode") String awardCode);

  // Insert idempotente: ON CONFLICT DO NOTHING; devuelve filas afectadas (1 si creó, 0 si ya existía)
  @Modifying
  @Transactional
  @Query(value = """
      INSERT INTO student_inventory
        (id, student_id, cosmetic_item_id, source, award_code, awarded_at, metadata_json,
         created_by, updated_by, created_at, updated_at)
      VALUES
        (:id, :studentId, :itemId, :source::reward_source, :awardCode, :awardedAt, :metadataJson,
         :actor, :actor, NOW(), NOW())
      ON CONFLICT ON CONSTRAINT ux_inventory_idempotent DO NOTHING
      """, nativeQuery = true)
  int insertIdempotent(@Param("id") UUID id,
                       @Param("studentId") UUID studentId,
                       @Param("itemId") UUID itemId,
                       @Param("source") String source,
                       @Param("awardCode") String awardCode,
                       @Param("awardedAt") Instant awardedAt,
                       @Param("metadataJson") String metadataJson,
                       @Param("actor") String actor);

  // (Opcional) Conteo por alumno para métricas
  @Query(value = """
      SELECT COUNT(*) FROM student_inventory
       WHERE student_id = :studentId
      """, nativeQuery = true)
  int countByStudent(@Param("studentId") UUID studentId);
}
