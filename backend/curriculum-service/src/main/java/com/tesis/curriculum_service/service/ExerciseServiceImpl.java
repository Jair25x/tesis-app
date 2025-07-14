package com.tesis.curriculum_service.service;

import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.tesis.curriculum_service.dto.ExerciseRequest;
import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.dto.SolutionStepResponse;
import com.tesis.curriculum_service.dto.FieldDescriptor.FieldType;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.dto.TemplateSchema;
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
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

  private final ExerciseRepository exerciseRepo;
  private final LearningObjectiveRepository loRepo;
  private final ExerciseTemplateService templateService;
  private final MustacheFactory mustacheFactory;

  @Override
  @Transactional
  public ExerciseResponse create(UUID loId, ExerciseRequest req) {
    LearningObjective lo = loRepo.findById(loId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", loId));

    // 1) Validar params
    validateParameters(req.getTemplateType(), req.getParameters());

    // 2) Render statement
    String stmt = renderStatement(req.getStatement(), req.getTemplateType(), req.getParameters());

    // 3) Persistir
    Exercise ex = Exercise.builder()
        .statement(stmt)
        .difficulty(req.getDifficulty())
        .type(req.getType())
        .templateType(req.getTemplateType())
        .parameters(req.getParameters())
        .learningObjective(lo)
        .build();

    Exercise saved = exerciseRepo.save(ex);
    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllByLearningObjective(UUID loId) {
    if (!loRepo.existsById(loId)) {
      throw new ResourceNotFoundException("LearningObjective", "id", loId);
    }
    return exerciseRepo.findByLearningObjectiveId(loId).stream()
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

    // 1) Validar params
    validateParameters(req.getTemplateType(), req.getParameters());

    // 2) Render nuevo enunciado
    String stmt = renderStatement(req.getStatement(), req.getTemplateType(), req.getParameters());

    // 3) Actualizar campos
    ex.setStatement(stmt);
    ex.setDifficulty(req.getDifficulty());
    ex.setType(req.getType());
    ex.setTemplateType(req.getTemplateType());
    ex.setParameters(req.getParameters());

    Exercise updated = exerciseRepo.save(ex);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    exerciseRepo.delete(ex); // soft-delete
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

  // --------------------------------------------------
  // Validación de parámetros contra TemplateSchema
  // --------------------------------------------------
  private void validateParameters(TemplateType tplType, Map<String, Object> params) {
    if (tplType == null) {
      return;
    }
    TemplateSchema schema = templateService.schemaFor(tplType)
        .orElseThrow(() -> new BadRequestException("Plantilla no encontrada: " + tplType));

    for (var fd : schema.getFields()) {
      String name = fd.getName();
      Object raw = params.get(name);
      if (raw == null) {
        throw new BadRequestException("Falta parámetro requerido: " + name);
      }
      switch (fd.getType()) {
        case NUMBER -> {
          if (!(raw instanceof Number)) {
            throw new BadRequestException(
                String.format("Parámetro '%s' debe ser numérico, no %s", name, raw.getClass().getSimpleName()));
          }
          double value = ((Number) raw).doubleValue();
          if (fd.getMin() != null && value < fd.getMin()) {
            throw new BadRequestException(
                String.format("Parámetro '%s' (%.2f) menor que mínimo (%d)", name, value, fd.getMin()));
          }
          if (fd.getMax() != null && value > fd.getMax()) {
            throw new BadRequestException(
                String.format("Parámetro '%s' (%.2f) mayor que máximo (%d)", name, value, fd.getMax()));
          }
        }
        case CHOICE -> {
          String s = raw.toString();
          if (fd.getChoices() == null || !fd.getChoices().contains(s)) {
            throw new BadRequestException(
                String.format("Parámetro '%s' debe ser uno de %s", name, fd.getChoices()));
          }
        }
        case TEXT -> {
          if (!(raw instanceof String)) {
            throw new BadRequestException(
                String.format("Parámetro '%s' debe ser texto, no %s", name, raw.getClass().getSimpleName()));
          }
        }
      }
    }
  }

  // --------------------------------------------------
  // Renderizado Mustache con manejo de IOException
  // --------------------------------------------------
  private String renderStatement(String rawStatement,
      TemplateType tplType,
      Map<String, Object> params) {
    if (tplType != null) {
      TemplateSchema schema = templateService.schemaFor(tplType)
          .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada: " + tplType));
      Mustache mustache = mustacheFactory.compile(
          new StringReader(schema.getPattern()),
          tplType.name());
      try {
        StringWriter writer = new StringWriter();
        mustache.execute(writer, params).flush();
        return writer.toString();
      } catch (IOException e) {
        throw new RuntimeException("Error al renderizar plantilla " + tplType, e);
      }
    }
    return rawStatement;
  }

  // --------------------------------------------------
  // Mapeo entidad → DTO
  // --------------------------------------------------
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
        .solutionSteps(e.getSolutionSteps().stream()
            .sorted(Comparator.comparingInt(s -> s.getStepNumber()))
            .map(ss -> SolutionStepResponse.builder()
                .id(ss.getId())
                .stepNumber(ss.getStepNumber())
                .explanation(ss.getExplanation())
                .createdAt(ss.getCreatedAt())
                .updatedAt(ss.getUpdatedAt())
                .build())
            .collect(Collectors.toList()))
        .hints(e.getHints().stream()
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
}
