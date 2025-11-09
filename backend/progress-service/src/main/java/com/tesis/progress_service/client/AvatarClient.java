package com.tesis.progress_service.client;

import com.tesis.progress_service.dto.AvatarClaimRequest;

public interface AvatarClient {
  void claimReward(AvatarClaimRequest req);
}
