package com.tesis.classroom_service.service;

import com.tesis.classroom_service.dto.request.CreateClassroomRequest;
import com.tesis.classroom_service.dto.request.UpdateClassroomRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.ClassroomSummaryDto;

import java.util.List;
import java.util.UUID;

public interface ClassroomService {

  ClassroomDetailDto create(UUID ownerUuid, CreateClassroomRequest req);

  ClassroomDetailDto update(UUID classroomId, UUID ownerUuid, UpdateClassroomRequest req);

  void delete(UUID classroomId, UUID ownerUuid); // soft delete (active=false)

  ClassroomDetailDto getDetail(UUID classroomId, UUID requesterUuid); // visible si es owner o miembro

  List<ClassroomSummaryDto> listMine(UUID ownerUuid);

  List<ClassroomSummaryDto> listEnrolled(UUID studentUuid);
}
