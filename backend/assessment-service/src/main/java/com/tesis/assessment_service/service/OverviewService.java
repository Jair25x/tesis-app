package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.response.OverviewResponse;

import java.util.UUID;

/** Servicio dedicado a métricas de overview (puede ser usado por AssignmentService). */
public interface OverviewService {
    OverviewResponse compute(UUID assignmentId);
}
