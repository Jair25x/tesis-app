package com.tesis.classroom_service.service;

import com.tesis.classroom_service.dto.request.GenerateJoinCodeRequest;
import com.tesis.classroom_service.dto.request.JoinRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.JoinCodeDto;

import java.util.UUID;

public interface JoinCodeService {

  JoinCodeDto generate(UUID classroomId, UUID ownerUuid, GenerateJoinCodeRequest req);

  JoinCodeDto getActive(UUID classroomId, UUID ownerUuid);

  void revoke(UUID classroomId, UUID ownerUuid);

  ClassroomDetailDto join(UUID studentUuid, JoinRequest req);
}
