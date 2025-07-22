package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para gestionar Objetivos de Aprendizaje.
 * Permite operaciones CRUD, borrado lógico y reactivación
 * en el contexto de un estándar dentro de una competencia y currículo.
 */
public interface LearningObjectiveService {

        /**
         * Crea un nuevo objetivo de aprendizaje dentro de un estándar.
         *
         * @param curriculumId ID del currículo padre
         * @param competencyId ID de la competencia asociada
         * @param standardId   ID del estándar donde se agregará el objetivo
         * @param req          Datos del objetivo a crear
         * @return Objetivo creado como DTO de respuesta
         * @throws ResourceNotFoundException si no se encuentra el currículo,
         *                                   competencia o estándar
         */
        LearningObjectiveResponse create(UUID curriculumId, UUID competencyId, UUID standardId,
                        LearningObjectiveRequest req) throws ResourceNotFoundException;

        /**
         * Lista todos los objetivos activos de un estándar.
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @return Lista de objetivos como DTOs de respuesta
         * @throws ResourceNotFoundException si alguno de los recursos padre no existe
         */
        List<LearningObjectiveResponse> getAllByStandard(UUID curriculumId, UUID competencyId, UUID standardId)
                        throws ResourceNotFoundException;

        /**
         * Lista todos los objetivos inactivos (soft deleted) de un estándar.
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @return Lista de objetivos inactivos como DTOs
         * @throws ResourceNotFoundException si alguno de los recursos padre no existe
         */
        List<LearningObjectiveResponse> getAllInactive(UUID curriculumId, UUID competencyId, UUID standardId)
                        throws ResourceNotFoundException;

        /**
         * Lista todos los objetivos (activos e inactivos) de un estándar.
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @return Lista completa de objetivos como DTOs
         * @throws ResourceNotFoundException si alguno de los recursos padre no existe
         */
        List<LearningObjectiveResponse> getAllIncludingInactive(UUID curriculumId, UUID competencyId, UUID standardId)
                        throws ResourceNotFoundException;

        /**
         * Obtiene un objetivo específico por su ID.
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @param id           ID del objetivo de aprendizaje
         * @return DTO con los datos del objetivo
         * @throws ResourceNotFoundException si no se encuentra el recurso
         */
        LearningObjectiveResponse getById(UUID curriculumId, UUID competencyId, UUID standardId, UUID id)
                        throws ResourceNotFoundException;

        /**
         * Actualiza un objetivo de aprendizaje existente.
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @param id           ID del objetivo a actualizar
         * @param req          Datos nuevos del objetivo
         * @return DTO actualizado
         * @throws ResourceNotFoundException si no se encuentra el recurso
         */
        LearningObjectiveResponse update(UUID curriculumId, UUID competencyId, UUID standardId, UUID id,
                        LearningObjectiveRequest req) throws ResourceNotFoundException;

        /**
         * Realiza un borrado lógico del objetivo (soft delete).
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @param id           ID del objetivo a eliminar
         * @throws ResourceNotFoundException si no se encuentra el recurso
         */
        void delete(UUID curriculumId, UUID competencyId, UUID standardId, UUID id)
                        throws ResourceNotFoundException;

        /**
         * Reactiva un objetivo previamente eliminado lógicamente.
         *
         * @param curriculumId ID del currículo
         * @param competencyId ID de la competencia
         * @param standardId   ID del estándar
         * @param id           ID del objetivo a reactivar
         * @throws ResourceNotFoundException si no se encuentra el recurso
         */
        void reactivate(UUID curriculumId, UUID competencyId, UUID standardId, UUID id)
                        throws ResourceNotFoundException;
}
