package com.tesis.avatar_service.dto;

import lombok.Builder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.tesis.avatar_service.model.CosmeticSlot;

public class AvatarDtos {

  @Builder
  public record CatalogItemDto(
      UUID id,
      String code,
      String displayName,
      String slot,
      String rarity,
      String assetUrl) {
  }

  @Builder
  public record InventoryItemDto(
      UUID id,
      String source,
      String awardCode,
      Instant awardedAt,
      UUID itemId,
      String itemCode,
      String displayName,
      String slot,
      String rarity,
      String assetUrl) {
  }

  @Builder
  public record LoadoutSlotDto(
      String slot,
      java.util.UUID itemId,
      String itemCode,
      String displayName,
      String assetUrl,
      String rarity,
      LocalDateTime updatedAt) {
  }

  @Builder
  public record LoadoutDto(List<LoadoutSlotDto> slots) {
  }

  @Builder
  public record RewardClaimRequest(
      UUID studentId,
      String source, // "ACHIEVEMENT"
      String triggerCode, // p.ej. "STREAK_3D"
      String awardCode, // idem trigger o un code de evento único
      String metadataJson,
      String actor // usuario técnico S2S
  ) {
  }

  public enum RewardClaimStatus {
    NEW, DUPLICATE, NOT_FOUND, INVALID
  }

  @Builder
  public record RewardClaimResult(RewardClaimStatus status, String message) {
  }

  @Builder
  public record EquipRequest(
      UUID studentId,
      String slot, // CosmeticSlot text
      UUID itemId, // null para limpiar
      String actor) {
  }

  @Builder
  public record EquipResult(boolean updated, String message) {
  }
}
