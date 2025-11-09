package com.tesis.progress_service.dto;

import java.util.UUID;

public record AvatarClaimRequest(
    UUID studentId,
    String source,
    String awardCode,
    String triggerCode,
    String metadataJson) {
}
