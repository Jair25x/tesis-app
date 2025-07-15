package com.tesis.curriculum_service.service;

import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.tesis.curriculum_service.dto.*;
import com.tesis.curriculum_service.dto.FieldDescriptor.FieldType;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.exception.BadRequestException;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import com.tesis.curriculum_service.service.template.ExerciseTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

  private final ExerciseRepository exerciseRepo;
  private final LearningObjectiveRepository loRepo;
  private final ExerciseTemplateService templateService;
  private final MustacheFactory mustacheFactory;

  /* ─────────────────────────────── CRUD ─────────────────────────────── */

  @Override
  @Transactional
  public ExerciseResponse create(UUID loId, ExerciseRequest req) {

    LearningObjective lo = loRepo.findById(loId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", loId));

    validateParameters(req.getTemplateType(), req.getParameters());

    String stmt = renderStatement(req.getStatement(), req.getTemplateType(), req.getParameters());

    Exercise ex = Exercise.builder()
        .statement(stmt)
        .difficulty(req.getDifficulty())
        .type(req.getType())
        .templateType(req.getTemplateType())
        .parameters(req.getParameters())
        /* NUEVO */
        .correctAnswer(req.getCorrectAnswer())
        .learningObjective(lo)
        .build();

    return toDto(exerciseRepo.save(ex));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllByLearningObjective(UUID loId) {
    if (!loRepo.existsById(loId)) {
      throw new ResourceNotFoundException("LearningObjective", "id", loId);
    }
    return exerciseRepo.findByLearningObjectiveId(loId)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public ExerciseResponse getById(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    return toDto(ex);
  }

  @Override
  @Transactional
  public ExerciseResponse update(UUID loId, UUID id, ExerciseRequest req) {

    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));

    validateParameters(req.getTemplateType(), req.getParameters());

    String stmt = renderStatement(req.getStatement(), req.getTemplateType(), req.getParameters());

    ex.setStatement(stmt);
    ex.setDifficulty(req.getDifficulty());
    ex.setType(req.getType());
    ex.setTemplateType(req.getTemplateType());
    ex.setParameters(req.getParameters());
    /* NUEVO */
    ex.setCorrectAnswer(req.getCorrectAnswer());

    return toDto(exerciseRepo.save(ex));
  }

  @Override
  @Transactional
  public void delete(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    exerciseRepo.delete(ex); // soft‑delete por @SQLDelete
  }

  @Override
  @Transactional
  public void reactivate(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdIncludingInactive(id)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));

    if (!ex.getLearningObjective().getId().equals(loId)) {
      throw new ResourceNotFoundException("Exercise", "id", id);
    }

    ex.setActive(true);
    ex.setDeletedAt(null);
    ex.setUpdatedAt(LocalDateTime.now());
    exerciseRepo.save(ex);
  }

  /* ──────────────────────── CHECK ANSWER ───────────────────────── */

  @Override
  @Transactional(readOnly = true)
  public CheckAnswerResponse checkAnswer(
      UUID curriculumId,
      UUID competencyId,
      UUID standardId,
      UUID learningObjectiveId,
      UUID exerciseId,
      CheckAnswerRequest request) {

    Exercise exercise = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    // (Aquí podrías verificar toda la jerarquía, si lo deseas)

    String expected = Optional.ofNullable(exercise.getCorrectAnswer()).orElse("").trim();
    String given = Optional.ofNullable(request.getStudentAnswer()).orElse("").trim();

    boolean ok = expected.equalsIgnoreCase(given);

    return CheckAnswerResponse.builder()
        .correct(ok)
        .feedback(ok ? "✅ ¡Muy bien!" : "❌ Intenta otra vez")
        .xpAwarded(ok ? 10 : 0)
        .remainingHints(3) // TODO: lógica real por usuario/sesión
        .nextExerciseId(null) // TODO: buscar siguiente ejercicio
        .build();
  }

  /* ────────────────────── Helpers de validación/render ────────────────── */

  private void validateParameters(TemplateType tplType, Map<String, Object> params) {
    if (tplType == null)
      return;

    TemplateSchema schema = templateService.schemaFor(tplType)
        .orElseThrow(() -> new BadRequestException("Plantilla no encontrada: " + tplType));

    for (FieldDescriptor fd : schema.getFields()) {
      Object raw = params.get(fd.getName());
      if (raw == null)
        throw new BadRequestException("Falta parámetro requerido: " + fd.getName());

      switch (fd.getType()) {
        case NUMBER -> {
          if (!(raw instanceof Number n))
            throw new BadRequestException(paramTypeErr(fd, raw));
          double v = n.doubleValue();
          if (fd.getMin() != null && v < fd.getMin())
            throw new BadRequestException(minErr(fd, v));
          if (fd.getMax() != null && v > fd.getMax())
            throw new BadRequestException(maxErr(fd, v));
        }
        case CHOICE -> {
          String s = raw.toString();
          if (fd.getChoices() == null || !fd.getChoices().contains(s))
            throw new BadRequestException(choiceErr(fd));
        }
        case TEXT -> {
          if (!(raw instanceof String))
            throw new BadRequestException(paramTypeErr(fd, raw));
        }
      }
    }
  }

  private String renderStatement(String raw, TemplateType tplType, Map<String, Object> params) {
    if (tplType == null)
      return raw;

    TemplateSchema schema = templateService.schemaFor(tplType)
        .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada: " + tplType));

    Mustache m = mustacheFactory.compile(new StringReader(schema.getPattern()), tplType.name());
    try (StringWriter w = new StringWriter()) {
      m.execute(w, params).flush();
      return w.toString();
    } catch (IOException ex) {
      throw new RuntimeException("Error al renderizar plantilla " + tplType, ex);
    }
  }

  /* ────────────────────────── DTO mapping ────────────────────────────── */

  private ExerciseResponse toDto(Exercise e) {

    var lo = e.getLearningObjective();
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    return ExerciseResponse.builder()
        .id(e.getId())
        .statement(e.getStatement())
        .difficulty(e.getDifficulty())
        .type(e.getType())
        .templateType(e.getTemplateType())
        .parameters(e.getParameters())
        .learningObjectiveId(lo.getId())
        .learningObjectiveName(lo.getName())
        .standardId(std.getId())
        .standardName(std.getName())
        .competencyId(comp.getId())
        .competencyName(comp.getName())
        .curriculumId(cur.getId())
        .solutionSteps(e.getSolutionSteps()
            .stream()
            .sorted(Comparator.comparingInt(s -> s.getStepNumber()))
            .map(ss -> SolutionStepResponse.builder()
                .id(ss.getId())
                .stepNumber(ss.getStepNumber())
                .explanation(ss.getExplanation())
                .createdAt(ss.getCreatedAt())
                .updatedAt(ss.getUpdatedAt())
                .build())
            .collect(Collectors.toList()))
        .hints(e.getHints()
            .stream()
            .map(h -> HintResponse.builder()
                .id(h.getId())
                .hintText(h.getHintText())
                .cost(h.getCost())
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build())
            .collect(Collectors.toList()))
        .createdAt(e.getCreatedAt())
        .updatedAt(e.getUpdatedAt())
        .active(e.getActive())
        .build();
  }

  /* ─────────── Mensajes de error helper (solo legibilidad) ───────────── */

  private String paramTypeErr(FieldDescriptor fd, Object raw) {
    return "Parámetro '" + fd.getName() + "' debe ser " + fd.getType() +
        ", no " + raw.getClass().getSimpleName();
  }

  private String minErr(FieldDescriptor fd, double v) {
    return "Parámetro '" + fd.getName() + "' (" + v + ") menor que mínimo (" + fd.getMin() + ")";
  }

  private String maxErr(FieldDescriptor fd, double v) {
    return "Parámetro '" + fd.getName() + "' (" + v + ") mayor que máximo (" + fd.getMax() + ")";
  }

  private String choiceErr(FieldDescriptor fd) {
    return "Parámetro '" + fd.getName() + "' debe ser uno de " + fd.getChoices();
  }
}
