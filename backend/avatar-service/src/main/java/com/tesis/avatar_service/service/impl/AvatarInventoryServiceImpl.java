package com.tesis.avatar_service.service.impl;

import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.model.CosmeticItem;
import com.tesis.avatar_service.model.RewardSource;
import com.tesis.avatar_service.repository.CosmeticItemRepository;
import com.tesis.avatar_service.repository.StudentInventoryRepository;
import com.tesis.avatar_service.service.AvatarInventoryService;
import com.tesis.avatar_service.service.RewardResolver;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AvatarInventoryServiceImpl implements AvatarInventoryService {

  private final StudentInventoryRepository inventoryRepository;
  private final CosmeticItemRepository cosmeticItemRepository;
  private final RewardResolver rewardResolver;
  private final MeterRegistry meterRegistry;

  private Counter claimsOk(String source) {
    return Counter.builder("avatar_reward_claims_total")
        .tag("status", "ok")
        .tag("source", source)
        .register(meterRegistry);
  }

  private Counter claimsDup(String source) {
    return Counter.builder("avatar_reward_claims_total")
        .tag("status", "duplicate")
        .tag("source", source)
        .register(meterRegistry);
  }

  private Counter claimsErr(String source) {
    return Counter.builder("avatar_reward_claims_total")
        .tag("status", "error")
        .tag("source", source)
        .register(meterRegistry);
  }

  @Override
  @Transactional(readOnly = true)
  public List<AvatarDtos.InventoryItemDto> getInventory(UUID studentId) {
    var rows = inventoryRepository.findInventoryByStudent(studentId);
    return rows.stream().map(r -> AvatarDtos.InventoryItemDto.builder()
        .id(r.getId())
        .source(r.getSource())
        .awardCode(r.getAwardCode())
        .awardedAt(r.getAwardedAt())
        .itemId(r.getItemId())
        .itemCode(r.getItemCode())
        .displayName(r.getDisplayName())
        .slot(r.getSlot())
        .rarity(r.getRarity())
        .assetUrl(r.getAssetUrl())
        .build()).toList();
  }

  @Override
  @Transactional
  public AvatarDtos.RewardClaimResult claim(AvatarDtos.RewardClaimRequest req) {
    // Validaciones básicas
    if (req.studentId() == null || req.source() == null || req.awardCode() == null) {
      return AvatarDtos.RewardClaimResult.builder()
          .status(AvatarDtos.RewardClaimStatus.INVALID)
          .message("studentId/source/awardCode requeridos").build();
    }

    RewardSource source;
    try {
      source = RewardSource.valueOf(req.source().toUpperCase());
    } catch (IllegalArgumentException ex) {
      return AvatarDtos.RewardClaimResult.builder()
          .status(AvatarDtos.RewardClaimStatus.INVALID)
          .message("source inválido").build();
    }

    // Resolución de regla → CosmeticItem
    String trigger = req.triggerCode() == null ? req.awardCode() : req.triggerCode();
    CosmeticItem item = rewardResolver.resolve(source, trigger);
    if (item == null) {
      claimsErr(source.name()).increment();
      return AvatarDtos.RewardClaimResult.builder()
          .status(AvatarDtos.RewardClaimStatus.NOT_FOUND)
          .message("No hay regla de recompensa para el trigger: " + trigger).build();
    }

    // Idempotencia: insert ON CONFLICT DO NOTHING
    UUID id = UUID.randomUUID();
    int affected = inventoryRepository.insertIdempotent(
        id,
        req.studentId(),
        item.getId(),
        source.name(),
        req.awardCode(),
        Instant.now(),
        (req.metadataJson() == null || req.metadataJson().isBlank()) ? "{}" : req.metadataJson(),
        req.actor() == null ? "system" : req.actor());

    if (affected == 1) {
      claimsOk(source.name()).increment();
      return AvatarDtos.RewardClaimResult.builder()
          .status(AvatarDtos.RewardClaimStatus.NEW)
          .message("Recompensa otorgada").build();
    } else {
      claimsDup(source.name()).increment();
      return AvatarDtos.RewardClaimResult.builder()
          .status(AvatarDtos.RewardClaimStatus.DUPLICATE)
          .message("Recompensa ya había sido registrada").build();
    }
  }
}
