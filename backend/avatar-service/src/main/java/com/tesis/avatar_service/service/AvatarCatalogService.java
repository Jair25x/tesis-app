package com.tesis.avatar_service.service;

import com.tesis.avatar_service.dto.AvatarDtos;

import java.util.List;

public interface AvatarCatalogService {
  List<AvatarDtos.CatalogItemDto> getActiveCatalog(String slot, String rarity, String q);
}
