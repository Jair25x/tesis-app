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
 * Define operaciones CRUD, soft-delete, reactivación y verificación de
 * respuesta.
 */
public interface ExerciseService {

        /**
         * Crea un nuevo ejercicio dentro de un objetivo de aprendizaje.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo de aprendizaje
         * @param request             Datos del nuevo ejercicio
         * @return DTO del ejercicio creado
         * @throws ResourceNotFoundException si algún recurso padre no existe
         */
        ExerciseResponse create(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId,
                        ExerciseRequest request) throws ResourceNotFoundException;

        /**
         * Obtiene todos los ejercicios activos asociados a un objetivo de aprendizaje.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo de aprendizaje
         * @return Lista de ejercicios activos
         * @throws ResourceNotFoundException si algún recurso padre no existe
         */
        List<ExerciseResponse> getAllByLearningObjective(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId) throws ResourceNotFoundException;

        /**
         * Obtiene un ejercicio por su ID dentro de un objetivo.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo
         * @param exerciseId          UUID del ejercicio
         * @return DTO del ejercicio
         * @throws ResourceNotFoundException si el recurso no existe
         */
        ExerciseResponse getById(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId,
                        UUID exerciseId) throws ResourceNotFoundException;

        /**
         * Actualiza los datos de un ejercicio existente.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo
         * @param exerciseId          UUID del ejercicio
         * @param request             Nuevos datos
         * @return DTO actualizado
         * @throws ResourceNotFoundException si el recurso no existe
         */
        ExerciseResponse update(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId,
                        UUID exerciseId,
                        ExerciseRequest request) throws ResourceNotFoundException;

        /**
         * Borra lógicamente un ejercicio.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo
         * @param exerciseId          UUID del ejercicio
         * @throws ResourceNotFoundException si el recurso no existe
         */
        void delete(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId,
                        UUID exerciseId) throws ResourceNotFoundException;

        /**
         * Reactiva un ejercicio previamente eliminado.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo
         * @param exerciseId          UUID del ejercicio
         * @throws ResourceNotFoundException si el recurso no existe (ni siquiera
         *                                   inactivo)
         */
        void reactivate(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId,
                        UUID exerciseId) throws ResourceNotFoundException;

        /**
         * Verifica si la respuesta enviada por el estudiante es correcta.
         *
         * @param curriculumId        UUID del currículo
         * @param competencyId        UUID de la competencia
         * @param standardId          UUID del estándar
         * @param learningObjectiveId UUID del objetivo
         * @param exerciseId          UUID del ejercicio
         * @param request             Contiene la respuesta enviada
         * @return Resultado indicando si es correcto, feedback, etc.
         * @throws ResourceNotFoundException si el ejercicio no existe
         */
        CheckAnswerResponse checkAnswer(UUID curriculumId,
                        UUID competencyId,
                        UUID standardId,
                        UUID learningObjectiveId,
                        UUID exerciseId,
                        CheckAnswerRequest request) throws ResourceNotFoundException;

        List<ExerciseResponse> getAllByLearningObjectiveInactive(UUID curriculumId, UUID competencyId, UUID standardId,
                        UUID learningObjectiveId) throws ResourceNotFoundException;

        List<ExerciseResponse> getAllByLearningObjectiveIncludingInactive(UUID curriculumId, UUID competencyId,
                        UUID standardId, UUID learningObjectiveId) throws ResourceNotFoundException;

}
