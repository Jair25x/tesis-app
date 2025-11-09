package com.tesis.avatar_service.service.impl;

import com.tesis.avatar_service.config.AvatarProperties;
import com.tesis.avatar_service.model.CosmeticItem;
import com.tesis.avatar_service.model.RewardSource;
import com.tesis.avatar_service.repository.CosmeticItemRepository;
import com.tesis.avatar_service.repository.RewardRuleRepository;
import com.tesis.avatar_service.service.RewardResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RewardResolverImpl implements RewardResolver {

  private final RewardRuleRepository rewardRuleRepository;
  private final CosmeticItemRepository cosmeticItemRepository;
  private final AvatarProperties properties;

  @Override
  public CosmeticItem resolve(RewardSource source, String triggerCode) {
    // 1) BD
    if (triggerCode != null && !triggerCode.isBlank()) {
      var ruleOpt = rewardRuleRepository.findActiveBySourceAndTrigger(source.name(), triggerCode);
      if (ruleOpt.isPresent()) {
        return ruleOpt.get().getCosmeticItem();
      }
    }
    // 2) Fallback YAML
    String key = source.name() + ":" + (triggerCode == null ? "" : triggerCode);
    String cosmeticCode = properties.getRewards().getMap() == null ? null
        : properties.getRewards().getMap().get(key);
    if (cosmeticCode != null && !cosmeticCode.isBlank()) {
      return cosmeticItemRepository.findByCode(cosmeticCode)
          .orElse(null);
    }
    return null;
  }
}
