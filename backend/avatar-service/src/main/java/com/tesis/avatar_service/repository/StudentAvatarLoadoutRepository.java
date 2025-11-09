package com.tesis.avatar_service.repository;

import com.tesis.avatar_service.model.StudentAvatarLoadout;
import com.tesis.avatar_service.model.CosmeticSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentAvatarLoadoutRepository extends JpaRepository<StudentAvatarLoadout, UUID> {

  // Loadout "expandido" (con info de item si existe)
  interface LoadoutRow {
    UUID getId();

    UUID getStudentId();

    String getSlot(); // CosmeticSlot como texto

    UUID getItemId(); // puede ser null

    String getItemCode(); // puede ser null

    String getDisplayName();

    String getAssetUrl();

    String getRarity();

    LocalDateTime getUpdatedAt(); // <-- LocalDateTime
  }

  @Query(value = """
      SELECT l.id as id,
             l.student_id as studentId,
             l.slot::text as slot,
             ci.id as itemId,
             ci.code as itemCode,
             ci.display_name as displayName,
             ci.asset_url as assetUrl,
             ci.rarity as rarity,
             l.updated_at as updatedAt
        FROM student_avatar_loadout l
        LEFT JOIN cosmetic_item ci ON ci.id = l.cosmetic_item_id
       WHERE l.student_id = :studentId
       ORDER BY l.slot ASC
      """, nativeQuery = true)
  List<LoadoutRow> findLoadoutRowsByStudent(@Param("studentId") UUID studentId);

  @Query(value = """
      SELECT * FROM student_avatar_loadout
       WHERE student_id = :studentId
         AND slot = :slot::cosmetic_slot
      """, nativeQuery = true)
  Optional<StudentAvatarLoadout> findByStudentAndSlot(@Param("studentId") UUID studentId,
      @Param("slot") String slot);

  // UPSERT del ítem en el slot (set)
  @Modifying
  @Transactional
  @Query(value = """
      INSERT INTO student_avatar_loadout
        (id, student_id, slot, cosmetic_item_id, updated_at,
         created_by, updated_by, created_at)
      VALUES
        (:id, :studentId, :slot::cosmetic_slot, :itemId, NOW(),
         :actor, :actor, NOW())
      ON CONFLICT (student_id, slot)
      DO UPDATE SET cosmetic_item_id = EXCLUDED.cosmetic_item_id,
                    updated_at = NOW(),
                    updated_by = :actor
      """, nativeQuery = true)
  int upsertSlot(@Param("id") UUID id,
      @Param("studentId") UUID studentId,
      @Param("slot") String slot,
      @Param("itemId") UUID itemId,
      @Param("actor") String actor);

  // Limpia el slot (cosmetic_item_id = NULL)
  @Modifying
  @Transactional
  @Query(value = """
      UPDATE student_avatar_loadout
         SET cosmetic_item_id = NULL,
             updated_at = NOW(),
             updated_by = :actor
       WHERE student_id = :studentId
         AND slot = :slot::cosmetic_slot
      """, nativeQuery = true)
  int clearSlot(@Param("studentId") UUID studentId,
      @Param("slot") String slot,
      @Param("actor") String actor);

  // Crea fila "vacía" si no existía y deja item null (para inicializar)
  @Modifying
  @Transactional
  @Query(value = """
      INSERT INTO student_avatar_loadout
        (id, student_id, slot, cosmetic_item_id, updated_at,
         created_by, updated_by, created_at)
      VALUES
        (:id, :studentId, :slot::cosmetic_slot, NULL, NOW(),
         :actor, :actor, NOW())
      ON CONFLICT (student_id, slot) DO NOTHING
      """, nativeQuery = true)
  int ensureSlotRow(@Param("id") UUID id,
      @Param("studentId") UUID studentId,
      @Param("slot") String slot,
      @Param("actor") String actor);
}
