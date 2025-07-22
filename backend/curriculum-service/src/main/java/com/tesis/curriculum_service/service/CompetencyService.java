package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Competency.
 * Define operaciones CRUD y lanza ResourceNotFoundException si no existe.
 */
public interface CompetencyService {

    CompetencyResponse create(UUID curriculumId, CompetencyRequest request)
            throws ResourceNotFoundException;

    List<CompetencyResponse> getAllByCurriculum(UUID curriculumId)
            throws ResourceNotFoundException;

    List<CompetencyResponse> getAllInactiveByCurriculum(UUID curriculumId)
            throws ResourceNotFoundException;

    List<CompetencyResponse> getAllIncludingInactiveByCurriculum(UUID curriculumId)
            throws ResourceNotFoundException;

    CompetencyResponse getById(UUID curriculumId, UUID id)
            throws ResourceNotFoundException;

    CompetencyResponse update(UUID curriculumId, UUID id, CompetencyRequest request)
            throws ResourceNotFoundException;

    void delete(UUID curriculumId, UUID id)
            throws ResourceNotFoundException;

    void reactivate(UUID curriculumId, UUID id)
            throws ResourceNotFoundException;
}
