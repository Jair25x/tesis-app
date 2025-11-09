package com.tesis.avatar_service.service;

import com.tesis.avatar_service.model.CosmeticItem;
import com.tesis.avatar_service.model.RewardSource;

public interface RewardResolver {
  /**
   * Resuelve el CosmeticItem para (source, triggerCode) usando:
   * 1) reward_rule en BD (si existe activa)
   * 2) fallback YAML (avatar.rewards.map["<SOURCE>:<TRIGGER>"])
   */
  CosmeticItem resolve(RewardSource source, String triggerCode);
}
