package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentSubmission;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, UUID> {

        Optional<AssessmentSubmission> findByAssignment_IdAndStudentIdAndAttemptNo(UUID assignmentId, UUID studentId,
                        int attemptNo);

        Optional<AssessmentSubmission> findTopByAssignment_IdAndStudentIdOrderByCreatedAtDesc(UUID assignmentId,
                        UUID studentId);

        // Para asignar el próximo attemptNo de forma robusta
        Optional<AssessmentSubmission> findTopByAssignment_IdAndStudentIdOrderByAttemptNoDesc(UUID assignmentId,
                        UUID studentId);

        // Para idempotencia (si ya hay un IN_PROGRESS, devolver ese)
        Optional<AssessmentSubmission> findTopByAssignment_IdAndStudentIdAndStatusOrderByCreatedAtDesc(
                        UUID assignmentId,
                        UUID studentId,
                        SubmissionStatus status);

        Page<AssessmentSubmission> findByAssignment_Id(UUID assignmentId, Pageable pageable);

        // Historial por alumno (con/sin filtro de estado)
        Page<AssessmentSubmission> findByStudentId(UUID studentId, Pageable pageable);

        Page<AssessmentSubmission> findByStudentIdAndStatus(UUID studentId, SubmissionStatus status, Pageable pageable);

        long countByAssignment_Id(UUID assignmentId);

        long countByAssignment_IdAndStatus(UUID assignmentId, SubmissionStatus status);

        // ------- usados en "Mis asignaciones" --------
        long countByAssignment_IdAndStudentId(UUID assignmentId, UUID studentId);

        boolean existsByAssignment_IdAndStudentIdAndStatus(UUID assignmentId, UUID studentId, SubmissionStatus status);

        boolean existsByAssignment_IdAndStudentIdAndStatusIn(UUID assignmentId, UUID studentId,
                        Collection<SubmissionStatus> statuses);

        @Query("""
                        select avg(case when s.maxScore is not null and s.maxScore > 0
                                        then cast(s.score as double) / cast(s.maxScore as double)
                                        else null end)
                        from AssessmentSubmission s
                        where s.assignment.id = :assignmentId and s.status in (com.tesis.assessment_service.model.enums.SubmissionStatus.SUBMITTED,
                                                                               com.tesis.assessment_service.model.enums.SubmissionStatus.GRADED)
                        """)
        Double avgNormalizedScoreByAssignment(UUID assignmentId);
}
