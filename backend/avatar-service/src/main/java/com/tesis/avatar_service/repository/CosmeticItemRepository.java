package com.tesis.avatar_service.repository;

import com.tesis.avatar_service.model.CosmeticItem;
import com.tesis.avatar_service.model.CosmeticSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CosmeticItemRepository extends JpaRepository<CosmeticItem, UUID> {

  @Query(value = """
      SELECT * FROM cosmetic_item
       WHERE active = true
       ORDER BY slot ASC, rarity ASC, display_name ASC
      """, nativeQuery = true)
  List<CosmeticItem> findAllActive();

  @Query(value = """
      SELECT * FROM cosmetic_item
       WHERE active = true
         AND (:slot IS NULL OR slot = :slot)
         AND (:rarity IS NULL OR rarity ILIKE :rarity)
         AND (
               :q IS NULL
            OR display_name ILIKE CONCAT('%', :q, '%')
            OR code ILIKE CONCAT('%', :q, '%')
         )
       ORDER BY slot ASC, rarity ASC, display_name ASC
      """, nativeQuery = true)
  List<CosmeticItem> findActiveCatalog(
      @Param("slot") String slot,
      @Param("rarity") String rarity,
      @Param("q") String q);

  @Query(value = """
      SELECT * FROM cosmetic_item
       WHERE code = :code
      """, nativeQuery = true)
  Optional<CosmeticItem> findByCode(@Param("code") String code);

  // Filtro por slot específico
  @Query(value = """
      SELECT * FROM cosmetic_item
       WHERE active = true
         AND slot = :slot
       ORDER BY rarity ASC, display_name ASC
      """, nativeQuery = true)
  List<CosmeticItem> findActiveBySlot(@Param("slot") String slot);

  // (Opcional) listado por rareza
  @Query(value = """
      SELECT * FROM cosmetic_item
       WHERE active = true
         AND rarity ILIKE :rarity
       ORDER BY slot ASC, display_name ASC
      """, nativeQuery = true)
  List<CosmeticItem> findActiveByRarity(@Param("rarity") String rarity);

  // Proyección simple (por si necesitas listar catálogos ligeros)
  interface CatalogRow {
    UUID getId();

    String getCode();

    String getDisplayName();

    String getSlot();

    String getRarity();

    String getAssetUrl();
  }

  @Query(value = """
      SELECT id, code, display_name AS displayName, slot::text AS slot,
             rarity, asset_url AS assetUrl
        FROM cosmetic_item
       WHERE active = true
       ORDER BY slot ASC, rarity ASC, display_name ASC
      """, nativeQuery = true)
  List<CatalogRow> findActiveCatalogLite();
}
