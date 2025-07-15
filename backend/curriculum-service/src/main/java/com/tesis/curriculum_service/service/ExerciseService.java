// src/main/java/com/tesis/curriculum_service/service/ExerciseService.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.dto.ExerciseRequest;
import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Exercise.
 * Define operaciones CRUD y soft-delete/reactivación.
 */
public interface ExerciseService {

    /**
     * Crea un nuevo ejercicio asociado a un LearningObjective.
     *
     * @param learningObjectiveId UUID del objetivo de aprendizaje padre.
     * @param request             DTO con los datos del ejercicio.
     * @return DTO con el ejercicio creado.
     * @throws ResourceNotFoundException si no existe el LearningObjective.
     */
    ExerciseResponse create(UUID learningObjectiveId, ExerciseRequest request)
            throws ResourceNotFoundException;

    /**
     * Recupera todos los ejercicios activos de un LearningObjective.
     *
     * @param learningObjectiveId UUID del objetivo de aprendizaje.
     * @return Lista de DTOs.
     * @throws ResourceNotFoundException si no existe el LearningObjective.
     */
    List<ExerciseResponse> getAllByLearningObjective(UUID learningObjectiveId)
            throws ResourceNotFoundException;

    /**
     * Recupera un ejercicio activo por su ID y LearningObjective.
     *
     * @param learningObjectiveId UUID del objetivo de aprendizaje.
     * @param id                  UUID del ejercicio.
     * @return DTO con el ejercicio.
     * @throws ResourceNotFoundException si no existe.
     */
    ExerciseResponse getById(UUID learningObjectiveId, UUID id)
            throws ResourceNotFoundException;

    /**
     * Actualiza un ejercicio existente.
     *
     * @param learningObjectiveId UUID del objetivo de aprendizaje.
     * @param id                  UUID del ejercicio.
     * @param request             DTO con nuevos datos.
     * @return DTO con el ejercicio actualizado.
     * @throws ResourceNotFoundException si no existe.
     */
    ExerciseResponse update(UUID learningObjectiveId, UUID id, ExerciseRequest request)
            throws ResourceNotFoundException;

    /**
     * Realiza un borrado lógico (soft-delete) de un ejercicio.
     *
     * @param learningObjectiveId UUID del objetivo de aprendizaje.
     * @param id                  UUID del ejercicio.
     * @throws ResourceNotFoundException si no existe.
     */
    void delete(UUID learningObjectiveId, UUID id)
            throws ResourceNotFoundException;

    /**
     * Reactiva un ejercicio previamente borrado.
     *
     * @param learningObjectiveId UUID del objetivo de aprendizaje.
     * @param id                  UUID del ejercicio.
     * @throws ResourceNotFoundException si no existe ni siquiera inactivo.
     */
    void reactivate(UUID learningObjectiveId, UUID id)
            throws ResourceNotFoundException;

    /**
     * Valida la respuesta enviada por el estudiante para un ejercicio específico.
     *
     * @param curriculumId        ID del currículo
     * @param competencyId        ID de la competencia
     * @param standardId          ID del estándar
     * @param learningObjectiveId ID del objetivo de aprendizaje
     * @param exerciseId          ID del ejercicio
     * @param request             Contiene la respuesta del estudiante
     * @return Resultado con feedback y datos adicionales
     */
    CheckAnswerResponse checkAnswer(UUID curriculumId,
            UUID competencyId,
            UUID standardId,
            UUID learningObjectiveId,
            UUID exerciseId,
            CheckAnswerRequest request) throws ResourceNotFoundException;

}
