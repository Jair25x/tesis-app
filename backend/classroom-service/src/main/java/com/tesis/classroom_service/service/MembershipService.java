// src/main/java/com/tesis/classroom_service/service/MembershipService.java
package com.tesis.classroom_service.service;

import com.tesis.classroom_service.dto.response.MemberDto;
import com.tesis.classroom_service.dto.response.PageResponse;
import com.tesis.classroom_service.model.enums.MemberRole;

import java.util.List;
import java.util.UUID;

public interface MembershipService {

   // PRIVADO (roles reales)
   PageResponse<MemberDto> listMembers(UUID classroomId, UUID requesterUuid,
         int page, int size, String sort, MemberRole role);

   MemberDto addMember(UUID classroomId, UUID ownerUuid, UUID userUuid, MemberRole role);

   void removeMember(UUID classroomId, UUID ownerUuid, UUID userUuid);

   // PÚBLICO (oculta roles a estudiantes), con expand + search
   PageResponse<MemberDto> listMembersPublic(UUID classroomId, UUID requesterUuid,
         boolean expandProfile, String search,
         int page, int size, String sort);

   // SELF-SERVICE: salir del aula (idempotente)
   void leave(UUID classroomId, UUID requesterUuid);
}
