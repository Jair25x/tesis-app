package com.tesis.avatar_service.service;

import com.tesis.avatar_service.dto.AvatarDtos;

import java.util.UUID;

public interface AvatarLoadoutService {
  AvatarDtos.LoadoutDto getLoadout(UUID studentId);

  AvatarDtos.EquipResult equip(AvatarDtos.EquipRequest req);

  void ensureDefaultRows(UUID studentId, String actor); // crea filas vacías para todos los slots si no existen
}
