package com.tesis.avatar_service.service;

import com.tesis.avatar_service.dto.AvatarDtos;

import java.util.List;

public interface AvatarInventoryService {
  List<AvatarDtos.InventoryItemDto> getInventory(java.util.UUID studentId);

  AvatarDtos.RewardClaimResult claim(AvatarDtos.RewardClaimRequest request);
}
