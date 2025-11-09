package com.tesis.avatar_service.service.impl;

import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.model.CosmeticItem;
import com.tesis.avatar_service.model.CosmeticSlot;
import com.tesis.avatar_service.repository.CosmeticItemRepository;
import com.tesis.avatar_service.repository.StudentAvatarLoadoutRepository;
import com.tesis.avatar_service.repository.StudentInventoryRepository;
import com.tesis.avatar_service.service.AvatarLoadoutService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AvatarLoadoutServiceImpl implements AvatarLoadoutService {

  private final StudentAvatarLoadoutRepository loadoutRepository;
  private final StudentInventoryRepository inventoryRepository;
  private final CosmeticItemRepository cosmeticItemRepository;
  private final MeterRegistry meterRegistry;

  private Counter loadoutCounter(String status) {
    return Counter.builder("avatar_loadout_updates_total")
        .tag("status", status)
        .register(meterRegistry);
  }

  @Override
  @Transactional(readOnly = true)
  public AvatarDtos.LoadoutDto getLoadout(UUID studentId) {
    var rows = loadoutRepository.findLoadoutRowsByStudent(studentId);
    var slots = rows.stream().map(r -> AvatarDtos.LoadoutSlotDto.builder()
        .slot(r.getSlot())
        .itemId(r.getItemId())
        .itemCode(r.getItemCode())
        .displayName(r.getDisplayName())
        .assetUrl(r.getAssetUrl())
        .rarity(r.getRarity())
        .updatedAt(r.getUpdatedAt())
        .build()).toList();
    return AvatarDtos.LoadoutDto.builder().slots(slots).build();
  }

  @Override
  @Transactional
  public AvatarDtos.EquipResult equip(AvatarDtos.EquipRequest req) {
    if (req.studentId() == null || req.slot() == null) {
      return AvatarDtos.EquipResult.builder().updated(false).message("studentId/slot requeridos").build();
    }
    String actor = (req.actor() == null || req.actor().isBlank()) ? "student" : req.actor();

    CosmeticSlot slot;
    try {
      slot = CosmeticSlot.valueOf(req.slot().toUpperCase());
    } catch (IllegalArgumentException ex) {
      return AvatarDtos.EquipResult.builder().updated(false).message("slot inválido").build();
    }

    // Limpiar slot
    if (req.itemId() == null) {
      int n = loadoutRepository.clearSlot(req.studentId(), slot.name(), actor);
      if (n == 0) {
        // Si no existe la fila, la aseguramos vacía
        loadoutRepository.ensureSlotRow(UUID.randomUUID(), req.studentId(), slot.name(), actor);
      }
      loadoutCounter("cleared").increment();
      return AvatarDtos.EquipResult.builder().updated(true).message("slot limpio").build();
    }

    // Validar item y ownership
    Optional<CosmeticItem> itemOpt = cosmeticItemRepository.findById(req.itemId());
    if (itemOpt.isEmpty()) {
      loadoutCounter("error").increment();
      return AvatarDtos.EquipResult.builder().updated(false).message("item no encontrado").build();
    }
    var item = itemOpt.get();
    if (!item.getSlot().name().equalsIgnoreCase(slot.name())) {
      loadoutCounter("error").increment();
      return AvatarDtos.EquipResult.builder().updated(false).message("item no corresponde al slot").build();
    }
    boolean owns = inventoryRepository.existsOwnership(req.studentId(), req.itemId());
    if (!owns) {
      loadoutCounter("error").increment();
      return AvatarDtos.EquipResult.builder().updated(false).message("el estudiante no posee este ítem").build();
    }

    // UPSERT
    int n = loadoutRepository.upsertSlot(UUID.randomUUID(), req.studentId(), slot.name(), req.itemId(), actor);
    loadoutCounter(n > 0 ? "ok" : "noop").increment();
    return AvatarDtos.EquipResult.builder().updated(n > 0).message("equipado").build();
  }

  @Override
  @Transactional
  public void ensureDefaultRows(UUID studentId, String actor) {
    String a = (actor == null || actor.isBlank()) ? "system" : actor;
    for (CosmeticSlot s : CosmeticSlot.values()) {
      loadoutRepository.ensureSlotRow(UUID.randomUUID(), studentId, s.name(), a);
    }
  }
}
