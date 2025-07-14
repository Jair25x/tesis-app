package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad LearningObjective.
 * Proporciona operaciones CRUD, soft‐delete y reactivación.
 */
public interface LearningObjectiveService {

    LearningObjectiveResponse create(UUID curriculumId, UUID competencyId, UUID standardId,
            LearningObjectiveRequest req);

    List<LearningObjectiveResponse> getAllByStandard(UUID curriculumId, UUID competencyId, UUID standardId);

    LearningObjectiveResponse getById(UUID curriculumId, UUID competencyId, UUID standardId, UUID id);

    LearningObjectiveResponse update(UUID curriculumId, UUID competencyId, UUID standardId, UUID id,
            LearningObjectiveRequest req);

    void delete(UUID curriculumId, UUID competencyId, UUID standardId, UUID id);

    void reactivate(UUID curriculumId, UUID competencyId, UUID standardId, UUID id);
}
