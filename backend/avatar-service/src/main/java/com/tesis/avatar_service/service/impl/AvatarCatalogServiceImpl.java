package com.tesis.avatar_service.service.impl;

import com.tesis.avatar_service.config.CacheConfig;
import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.model.CosmeticItem;
import com.tesis.avatar_service.repository.CosmeticItemRepository;
import com.tesis.avatar_service.service.AvatarCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvatarCatalogServiceImpl implements AvatarCatalogService {

  private final CosmeticItemRepository cosmeticItemRepository;

  @Override
  @Cacheable(cacheNames = CacheConfig.AVATAR_CATALOG, key = "#slot + '|' + (#rarity?:'') + '|' + (#q?:'')")
  public List<AvatarDtos.CatalogItemDto> getActiveCatalog(String slot, String rarity, String q) {
    final List<CosmeticItem> rows = cosmeticItemRepository.findActiveCatalog(slot, rarity, q);
    return rows.stream()
        .map(ci -> AvatarDtos.CatalogItemDto.builder()
            .id(ci.getId())
            .code(ci.getCode())
            .displayName(ci.getDisplayName())
            .slot(ci.getSlot().name())
            .rarity(ci.getRarity())
            .assetUrl(ci.getAssetUrl())
            .build())
        .toList();
  }
}
