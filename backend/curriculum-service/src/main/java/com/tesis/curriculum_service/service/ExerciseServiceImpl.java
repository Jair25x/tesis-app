package com.tesis.curriculum_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.tesis.curriculum_service.dto.*;
import com.tesis.curriculum_service.dto.FieldDescriptor.FieldType;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.exception.BadRequestException;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.SolutionStep;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import com.tesis.curriculum_service.service.template.ExerciseTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.tesis.curriculum_service.util.AnswerUtils.*;

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
  private final ObjectMapper objectMapper;

  /* ─────────────────────────────── CRUD ─────────────────────────────── */

  @Override
  @Transactional
  public ExerciseResponse create(UUID curriculumId, UUID competencyId, UUID standardId,
      UUID learningObjectiveId, ExerciseRequest req) {

    LearningObjective lo = validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    validateParameters(req.getTemplateType(), req.getParameters());
    String stmt = renderStatement(req.getStatement(), req.getTemplateType(), req.getParameters());

    Exercise ex = Exercise.builder()
        .statement(stmt)
        .difficulty(req.getDifficulty())
        .type(req.getType())
        .templateType(req.getTemplateType())
        .parameters(req.getParameters())
        .correctAnswer(req.getCorrectAnswer())
        .learningObjective(lo)
        .isDiagnostic(req.getIsDiagnostic())
        .build();

    return toStudentDto(exerciseRepo.save(ex));
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllByLearningObjective(UUID curriculumId, UUID competencyId,
      UUID standardId, UUID learningObjectiveId) {

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    return exerciseRepo.findByLearningObjectiveId(learningObjectiveId)
        .stream()
        .map(this::toStudentDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public ExerciseResponse getById(UUID curriculumId, UUID competencyId, UUID standardId,
      UUID learningObjectiveId, UUID exerciseId) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(exerciseId, learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));
    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);
    return toStudentDto(ex, false);
  }

  @Override
  @Transactional
  public ExerciseResponse update(UUID curriculumId, UUID competencyId, UUID standardId,
      UUID learningObjectiveId, UUID exerciseId, ExerciseRequest req) {

    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(exerciseId, learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    validateParameters(req.getTemplateType(), req.getParameters());
    String stmt = renderStatement(req.getStatement(), req.getTemplateType(), req.getParameters());

    ex.setStatement(stmt);
    ex.setDifficulty(req.getDifficulty());
    ex.setType(req.getType());
    ex.setTemplateType(req.getTemplateType());
    ex.setParameters(req.getParameters());
    ex.setCorrectAnswer(req.getCorrectAnswer());
    ex.setDiagnostic(req.getIsDiagnostic());

    return toStudentDto(exerciseRepo.save(ex));
  }

  @Override
  @Transactional
  public void delete(UUID curriculumId, UUID competencyId, UUID standardId,
      UUID learningObjectiveId, UUID exerciseId) {

    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(exerciseId, learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    exerciseRepo.delete(ex);
  }

  @Override
  @Transactional
  public void reactivate(UUID curriculumId, UUID competencyId, UUID standardId,
      UUID learningObjectiveId, UUID exerciseId) {

    Exercise ex = exerciseRepo.findByIdIncludingInactive(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    if (!ex.getLearningObjective().getId().equals(learningObjectiveId)) {
      throw new ResourceNotFoundException("Exercise", "id", exerciseId);
    }

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    ex.setActive(true);
    ex.setDeletedAt(null);
    ex.setUpdatedAt(LocalDateTime.now());
    exerciseRepo.save(ex);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllByLearningObjectiveInactive(UUID curriculumId, UUID competencyId,
      UUID standardId, UUID learningObjectiveId) {

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    return exerciseRepo.findInactiveByLearningObjectiveId(learningObjectiveId)
        .stream()
        .map(this::toStudentDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllByLearningObjectiveIncludingInactive(UUID curriculumId, UUID competencyId,
      UUID standardId, UUID learningObjectiveId) {

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    return exerciseRepo.findIncludingInactiveByLearningObjectiveId(learningObjectiveId)
        .stream()
        .map(this::toStudentDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllDiagnosticExercises() {
    return exerciseRepo.findAllByDiagnosticTrueAndActiveTrue()
        .stream()
        .map(this::toStudentDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public ExerciseAdminResponse getByIdAdmin(
      UUID curriculumId, UUID competencyId, UUID standardId, UUID learningObjectiveId, UUID id)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    Exercise e = exerciseRepo.findByIdAndLearningObjectiveId(id, learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));

    return toAdminDto(e);
  }

  @Override
  @Transactional(readOnly = true)
  public ExerciseResponse getByIdView(UUID curriculumId, UUID competencyId, UUID standardId,
      UUID learningObjectiveId, UUID exerciseId, boolean examMode) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(exerciseId, learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    return toStudentDto(ex, examMode);
  }

  @Override
  @Transactional(readOnly = true)
  public ExerciseResponse getByIdFlat(UUID exerciseId, boolean examMode) throws ResourceNotFoundException {
    var ex = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));
    // En el atajo ya no validamos la jerarquía porque la ruta es plana (es
    // intencional).
    return toStudentDto(ex, examMode);
  }

  /* ──────────────────────── CHECK ANSWER ───────────────────────── */

  @Override
  @Transactional(readOnly = true)
  public CheckAnswerResponse checkAnswer(
      UUID curriculumId, UUID competencyId, UUID standardId, UUID learningObjectiveId,
      UUID exerciseId, CheckAnswerRequest request) {

    Exercise exercise = exerciseRepo.findByIdAndLearningObjectiveId(exerciseId, learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    validateHierarchy(curriculumId, competencyId, standardId, learningObjectiveId);

    var type = exercise.getTemplateType();
    if (type == null) {
      CheckAnswerResponse base = CheckAnswerResponse.builder()
          .correct(false)
          .score(0.0)
          .feedback("El ejercicio no tiene templateType asignado.")
          .build();
      return attachMeta(exercise, base);
    }

    JsonNode answerNode = Optional.ofNullable(request.getAnswer())
        .orElse(objectMapper.createObjectNode());

    String templateInReq = answerNode.path("template").asText(null);
    if (templateInReq != null && !templateInReq.equalsIgnoreCase(type.name())) {
      CheckAnswerResponse base = CheckAnswerResponse.builder()
          .correct(false)
          .score(0.0)
          .feedback("La respuesta no corresponde al tipo de plantilla del ejercicio.")
          .build();
      return attachMeta(exercise, base);
    }

    // Delegamos a la validación específica de la plantilla
    return switch (type) {
      case EQUATION_SINGLE_CHOICE -> validateEquationSingleChoice(exercise, answerNode);
      case FREQUENCY_TABLE_QA -> validateFrequencyTableQa(exercise, answerNode);
      case FREQUENCY_TABLE_COMPLETE -> validateFrequencyTableComplete(exercise, answerNode);
      case BASE_TEN_BLOCKS_QA -> validateBaseTenBlocksQa(exercise, answerNode);
      case NUMBER_SEQUENCE_QA -> validateNumberSequenceQa(exercise, answerNode);
      case PLACE_VALUE_QA -> validatePlaceValueQa(exercise, answerNode);
      case NUMBER_WORDS_BIDIR -> validateNumberWordsBidir(exercise, answerNode);
      default -> validateLegacyByCorrectAnswer(exercise, answerNode);
    };
  }

  /* === Validadores MVP (ahora siempre usando attachMeta) === */

  // BASE_TEN_BLOCKS_QA: params.answer numérico
  private CheckAnswerResponse validateBaseTenBlocksQa(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());
    var expected = params.path("answer"); // number
    var given = answerNode.path("value");

    boolean ok = expected.isNumber() && (given.isNumber() || given.isTextual())
        && eqNumeric(given.isNumber() ? given.numberValue() : given.asText(), expected.numberValue());

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(ok)
        .score(ok ? 1.0 : 0.0)
        .feedback(ok ? "¡Correcto!" : "Respuesta incorrecta.")
        .build();

    return attachMeta(ex, base);
  }

  // NUMBER_SEQUENCE_QA: soporta answer (number) o answers (array)
  private CheckAnswerResponse validateNumberSequenceQa(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());

    var expAnswers = params.path("answers");
    var expAnswer = params.path("answer");

    boolean ok = false;

    var givenValue = answerNode.path("value");
    var givenValues = answerNode.path("values");

    if (expAnswers.isArray()) {
      // múltiple
      if (givenValues.isArray()) {
        if (expAnswers.size() == givenValues.size()) {
          ok = true;
          for (int i = 0; i < expAnswers.size(); i++) {
            var e = expAnswers.get(i);
            var g = givenValues.get(i);
            boolean thisOk = e.isNumber() && (g != null) &&
                (g.isNumber() || g.isTextual()) &&
                eqNumeric(g.isNumber() ? g.numberValue() : g.asText(), e.numberValue());
            if (!thisOk) {
              ok = false;
              break;
            }
          }
        }
      } else if (givenValue.isArray()) { // compatibilidad legacy
        if (expAnswers.size() == givenValue.size()) {
          ok = true;
          for (int i = 0; i < expAnswers.size(); i++) {
            var e = expAnswers.get(i);
            var g = givenValue.get(i);
            boolean thisOk = e.isNumber() && (g != null) &&
                (g.isNumber() || g.isTextual()) &&
                eqNumeric(g.isNumber() ? g.numberValue() : g.asText(), e.numberValue());
            if (!thisOk) {
              ok = false;
              break;
            }
          }
        }
      }
    } else if (expAnswer.isNumber()) {
      // único
      if (givenValue.isNumber() || givenValue.isTextual()) {
        ok = eqNumeric(
            givenValue.isNumber() ? givenValue.numberValue() : givenValue.asText(),
            expAnswer.numberValue());
      }
    }

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(ok)
        .score(ok ? 1.0 : 0.0)
        .feedback(ok ? "¡Bien!" : "Intenta otra vez.")
        .build();

    return attachMeta(ex, base);
  }

  // PLACE_VALUE_QA: ask define si comparar como número o texto
  private CheckAnswerResponse validatePlaceValueQa(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());
    String ask = params.path("ask").asText(""); // p.ej. "hundreds","expanded","compose", etc.
    var expected = params.path("answer");
    var given = answerNode.path("value");

    boolean numericAsk = switch (ask.toLowerCase()) {
      case "hundreds", "tens", "units", "value_of_digit", "compose", "tens_count", "hundreds_to_units" -> true;
      default -> false; // "expanded","expanded_choice","positional_of_digit" → texto
    };

    boolean ok;
    if (numericAsk) {
      ok = expected.isNumber() && (given.isNumber() || given.isTextual()) &&
          eqNumeric(given.isNumber() ? given.numberValue() : given.asText(), expected.numberValue());
    } else {
      ok = (given.isNumber() || given.isTextual()) &&
          eqText(given.asText(), expected.asText());
    }

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(ok)
        .score(ok ? 1.0 : 0.0)
        .feedback(ok ? "¡Correcto!" : "Revisa el valor posicional / forma desarrollada.")
        .build();

    return attachMeta(ex, base);
  }

  // NUMBER_WORDS_BIDIR
  private CheckAnswerResponse validateNumberWordsBidir(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());
    var choices = params.path("choices");
    var expected = params.path("answer");
    var given = answerNode.path("value");

    boolean ok = false;

    if (choices.isArray() && choices.size() > 0) {
      // opción múltiple textual
      ok = eqText(given.asText(""), expected.asText(""));
    } else {
      String direction = params.path("direction").asText("WORDS_TO_DIGITS"); // default tolerante
      if ("DIGITS_TO_WORDS".equalsIgnoreCase(direction)) {
        ok = eqText(given.asText(""), expected.asText(""));
      } else {
        // WORDS_TO_DIGITS → numérico
        if (expected.isNumber() && (given.isNumber() || given.isTextual())) {
          ok = eqNumeric(
              given.isNumber() ? given.numberValue() : given.asText(),
              expected.numberValue());
        }
      }
    }

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(ok)
        .score(ok ? 1.0 : 0.0)
        .feedback(ok ? "¡Bien!" : "Verifica la conversión palabras↔número.")
        .build();

    return attachMeta(ex, base);
  }

  private CheckAnswerResponse validateEquationSingleChoice(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());
    String expected = params.path("answer").asText(null);
    if (expected == null || expected.isBlank()) {
      expected = ex.getCorrectAnswer(); // soporte legacy
    }
    String given = answerNode.path("value").asText("");

    boolean ok = expected != null && expected.equalsIgnoreCase(given.trim());

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(ok)
        .score(ok ? 1.0 : 0.0)
        .feedback(ok ? "¡Correcto!" : "Respuesta incorrecta.")
        .build();

    return attachMeta(ex, base);
  }

  private CheckAnswerResponse validateFrequencyTableQa(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());
    var questions = params.path("questions");
    var answersNode = answerNode.path("answers");

    if (!questions.isArray()) {
      CheckAnswerResponse baseError = CheckAnswerResponse.builder()
          .correct(false)
          .score(0.0)
          .feedback("Plantilla inválida: questions no es un arreglo.")
          .build();
      return attachMeta(ex, baseError);
    }

    int total = questions.size();
    int correctCount = 0;
    Map<String, Boolean> perQuestion = new LinkedHashMap<>();

    for (var q : questions) {
      String id = q.path("id").asText();
      String kind = q.path("kind").asText("single_choice");
      var expected = q.path("answer");
      var given = answersNode.path(id);

      boolean ok;
      if ("numeric".equalsIgnoreCase(kind)) {
        ok = expected.isNumber() && given.isNumber()
            && Math.abs(expected.asDouble() - given.asDouble()) < 1e-6;
      } else {
        ok = expected.asText("").equalsIgnoreCase(given.asText(""));
      }
      perQuestion.put(id, ok);
      if (ok)
        correctCount++;
    }

    double score = total == 0 ? 0.0 : (double) correctCount / total;

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(score == 1.0)
        .score(score)
        .questionResults(perQuestion)
        .feedback(score == 1.0 ? "¡Muy bien!" : "Revisa las preguntas marcadas.")
        .build();

    return attachMeta(ex, base);
  }

  private CheckAnswerResponse validateFrequencyTableComplete(Exercise ex, JsonNode answerNode) {
    var params = asJson(ex.getParameters());
    var missing = params.path("missing");
    var filled = answerNode.path("filled");

    if (!missing.isArray()) {
      CheckAnswerResponse baseError = CheckAnswerResponse.builder()
          .correct(false)
          .score(0.0)
          .feedback("Plantilla inválida: missing no es un arreglo.")
          .build();
      return attachMeta(ex, baseError);
    }

    int total = missing.size();
    int correctCount = 0;
    for (var cell : missing) {
      String key = cell.path("cell").asText();
      var expected = cell.path("answer");
      var given = filled.path(key);

      boolean ok;
      if (expected.isNumber()) {
        ok = given.isNumber() && Math.abs(expected.asDouble() - given.asDouble()) < 1e-6;
      } else {
        ok = expected.asText("").equalsIgnoreCase(given.asText(""));
      }
      if (ok)
        correctCount++;
    }

    double score = total == 0 ? 0.0 : (double) correctCount / total;

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(score == 1.0)
        .score(score)
        .feedback(score == 1.0 ? "¡Excelente!" : "Algunas celdas no coinciden.")
        .build();

    return attachMeta(ex, base);
  }

  private CheckAnswerResponse validateLegacyByCorrectAnswer(Exercise ex, JsonNode answerNode) {
    String expected = ex.getCorrectAnswer();
    String given = answerNode.path("value").asText("");
    boolean ok = expected != null && expected.trim().equalsIgnoreCase(given.trim());

    CheckAnswerResponse base = CheckAnswerResponse.builder()
        .correct(ok)
        .score(ok ? 1.0 : 0.0)
        .feedback(ok ? "¡Correcto!" : "Intenta otra vez.")
        .build();

    return attachMeta(ex, base);
  }

  @Override
  @Transactional(readOnly = true)
  public CheckAnswerResponse checkAnswerByExerciseId(UUID exerciseId, CheckAnswerRequest request) {

    Exercise ex = exerciseRepo.findByIdIncludingInactive(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    var lo = ex.getLearningObjective();
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    // Delegar a la lógica ya existente (que ahora siempre adjunta meta)
    return checkAnswer(cur.getId(), comp.getId(), std.getId(), lo.getId(), ex.getId(), request);
  }

  private JsonNode asJson(Map<String, Object> map) {
    return objectMapper.valueToTree(map == null ? Map.of() : map);
  }

  /* ────────────────────── Validación de jerarquía ───────────────────── */

  private LearningObjective validateHierarchy(UUID curriculumId, UUID competencyId,
      UUID standardId, UUID learningObjectiveId) {

    LearningObjective lo = loRepo.findByIdWithFullHierarchy(learningObjectiveId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", learningObjectiveId));

    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    if (!std.getId().equals(standardId)
        || !comp.getId().equals(competencyId)
        || !cur.getId().equals(curriculumId)) {
      throw new ResourceNotFoundException("LearningObjective", "id", learningObjectiveId);
    }

    return lo;
  }

  /* ────────────────────── Mustache & helpers ───────────────────── */

  private void validateParameters(TemplateType tplType, Map<String, Object> params) {
    if (tplType == null)
      return;

    TemplateSchema schema = templateService.schemaFor(tplType)
        .orElseThrow(() -> new BadRequestException("Plantilla no encontrada: " + tplType));

    if (schema.getFields() == null || schema.getFields().isEmpty())
      return;

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
        case IMAGE -> {
          // Validación UI-side por ahora
        }
      }
    }
  }

  private String renderStatement(String raw, TemplateType tplType, Map<String, Object> params) {
    if (tplType == null)
      return raw != null ? raw : "";

    TemplateSchema schema = templateService.schemaFor(tplType)
        .orElseThrow(() -> new IllegalArgumentException("Plantilla no encontrada: " + tplType));

    if (schema.getPattern() == null || schema.getPattern().isBlank()) {
      return raw != null ? raw : "";
    }

    Mustache m = mustacheFactory.compile(new StringReader(schema.getPattern()), tplType.name());
    try (StringWriter w = new StringWriter()) {
      m.execute(w, params).flush();
      return w.toString();
    } catch (IOException ex) {
      throw new RuntimeException("Error al renderizar plantilla " + tplType, ex);
    }
  }

  private String renderForView(Exercise e) {
    // Hoy el statement ya está renderizado al crear/actualizar.
    // Si mañana soportas Markdown/LaTeX, aquí puedes transformarlo a HTML.
    return e.getStatement();
  }

  /* ────────────────────── DTO Mappers ───────────────────── */

  private ExerciseResponse toStudentDto(Exercise e) {
    return toStudentDto(e, false);
  }

  private ExerciseResponse toStudentDto(Exercise e, boolean examMode) {
    var lo = e.getLearningObjective();
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    var steps = examMode
        ? List.<SolutionStepResponse>of()
        : e.getSolutionSteps().stream()
            .sorted(Comparator.comparingInt(SolutionStep::getStepNumber))
            .map(ss -> SolutionStepResponse.builder()
                .id(ss.getId())
                .stepNumber(ss.getStepNumber())
                .explanation(ss.getExplanation())
                .createdAt(ss.getCreatedAt())
                .updatedAt(ss.getUpdatedAt())
                .build())
            .toList();

    var hints = examMode
        ? List.<HintResponse>of()
        : e.getHints().stream()
            .map(h -> HintResponse.builder()
                .id(h.getId())
                .hintText(h.getHintText())
                .cost(h.getCost())
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build())
            .toList();

    return ExerciseResponse.builder()
        .id(e.getId())
        .statement(e.getStatement())
        .statementRendered(renderForView(e)) // 👈 HTML listo para pintar
        .difficulty(e.getDifficulty())
        .type(e.getType())
        .templateType(e.getTemplateType())
        .parameters(e.getParameters())
        .isDiagnostic(e.isDiagnostic())

        .learningObjectiveId(lo.getId())
        .learningObjectiveName(lo.getName())
        .standardId(std.getId())
        .standardName(std.getName())
        .competencyId(comp.getId())
        .competencyName(comp.getName())
        .curriculumId(cur.getId())

        .solutionSteps(steps)
        .hints(hints)

        .createdAt(e.getCreatedAt())
        .updatedAt(e.getUpdatedAt())
        .active(e.getActive())
        .examMode(Boolean.valueOf(examMode))
        .build();
  }

  private ExerciseAdminResponse toAdminDto(Exercise e) {
    ExerciseResponse base = toStudentDto(e);
    return ExerciseAdminResponse.builder()
        .id(base.getId())
        .statement(base.getStatement())
        .difficulty(base.getDifficulty())
        .type(base.getType())
        .templateType(base.getTemplateType())
        .parameters(base.getParameters())

        .learningObjectiveId(base.getLearningObjectiveId())
        .learningObjectiveName(base.getLearningObjectiveName())
        .standardId(base.getStandardId())
        .standardName(base.getStandardName())
        .competencyId(base.getCompetencyId())
        .competencyName(base.getCompetencyName())
        .curriculumId(base.getCurriculumId())

        .solutionSteps(base.getSolutionSteps())
        .hints(base.getHints())

        .createdAt(base.getCreatedAt())
        .updatedAt(base.getUpdatedAt())
        .active(base.getActive())
        .isDiagnostic(base.getIsDiagnostic())

        .correctAnswer(e.getCorrectAnswer())
        .build();
  }

  /*
   * ────────────────────── Decorador de meta en CheckAnswerResponse
   * ─────────────────────
   */

  private CheckAnswerResponse attachMeta(Exercise ex, CheckAnswerResponse base) {
    var lo = ex.getLearningObjective();
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    return CheckAnswerResponse.builder()
        .correct(base.isCorrect())
        .score(base.getScore())
        .questionResults(base.getQuestionResults())
        .feedback(base.getFeedback())
        // meta oficial
        .curriculumId(cur.getId())
        .learningObjectiveId(lo.getId())
        .difficulty(ex.getDifficulty() != null ? ex.getDifficulty().name() : null)
        .maxScore(1.0) // hoy todas las plantillas están normalizadas 0..1
        .build();
  }

  /* ─────── Helpers para mensajes de error ─────── */

  private String paramTypeErr(FieldDescriptor fd, Object raw) {
    return "Parámetro '" + fd.getName() + "' debe ser " + fd.getType() + ", no " + raw.getClass().getSimpleName();
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
