package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Standard.
 * Define operaciones CRUD y soporta soft-delete y reactivación en cascada.
 */
public interface StandardService {

    StandardResponse create(UUID curriculumId,
            UUID competencyId,
            StandardRequest request)
            throws ResourceNotFoundException;

    List<StandardResponse> getAllByCompetency(UUID curriculumId,
            UUID competencyId)
            throws ResourceNotFoundException;

    List<StandardResponse> getAllInactiveByCompetency(UUID curriculumId,
            UUID competencyId)
            throws ResourceNotFoundException;

    List<StandardResponse> getAllIncludingInactiveByCompetency(UUID curriculumId,
            UUID competencyId)
            throws ResourceNotFoundException;

    List<StandardResponse> getAllByCompetency(UUID curriculumId, UUID competencyId, String status)
            throws ResourceNotFoundException;

    StandardResponse getById(UUID curriculumId,
            UUID competencyId,
            UUID id)
            throws ResourceNotFoundException;

    StandardResponse update(UUID curriculumId,
            UUID competencyId,
            UUID id,
            StandardRequest request)
            throws ResourceNotFoundException;

    void delete(UUID curriculumId,
            UUID competencyId,
            UUID id)
            throws ResourceNotFoundException;

    void reactivate(UUID curriculumId,
            UUID competencyId,
            UUID id)
            throws ResourceNotFoundException;
}
