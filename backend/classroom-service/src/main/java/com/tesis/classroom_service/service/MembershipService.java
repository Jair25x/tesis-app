package com.tesis.classroom_service.service;

import com.tesis.classroom_service.dto.response.MemberDto;
import com.tesis.classroom_service.model.enums.MemberRole;

import java.util.List;
import java.util.UUID;

public interface MembershipService {

  List<MemberDto> listMembers(UUID classroomId, UUID requesterUuid);

  MemberDto addMember(UUID classroomId, UUID ownerUuid, UUID userUuid, MemberRole role);

  void removeMember(UUID classroomId, UUID ownerUuid, UUID userUuid);
}
