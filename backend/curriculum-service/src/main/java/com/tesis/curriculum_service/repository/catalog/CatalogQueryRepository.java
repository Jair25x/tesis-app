// src/main/java/com/tesis/curriculum_service/repository/catalog/CatalogQueryRepository.java
package com.tesis.curriculum_service.repository.catalog;

import com.tesis.curriculum_service.dto.catalog.*;
import com.tesis.curriculum_service.model.Exercise;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.*;

@Repository
public class CatalogQueryRepository {

  @PersistenceContext
  private EntityManager em;

  // ───────────────────────── Competencies ─────────────────────────
  public Page<CatalogCompetencyDto> searchCompetencies(
      String q,
      UUID curriculumId,
      Pageable pageable) {
    var base = """
        SELECT new com.tesis.curriculum_service.dto.catalog.CatalogCompetencyDto(
          c.id, c.code, c.name, c.description,
          cur.id, cur.name
        )
        FROM Competency c
        JOIN c.curriculum cur
        """;

    var countBase = "SELECT COUNT(c.id) FROM Competency c JOIN c.curriculum cur";

    var where = new StringBuilder();
    var params = new HashMap<String, Object>();

    applyTextFilter(where, params, q, List.of("c.name", "c.code", "c.description"));
    applyEqFilter(where, params, "cur.id", "curriculumId", curriculumId);

    var jpql = base + where + buildOrderBy(pageable.getSort(), Map.of(
        "name", "c.name",
        "code", "c.code",
        "createdAt", "c.createdAt"), "c.name ASC, c.code ASC");

    var query = em.createQuery(jpql, CatalogCompetencyDto.class);
    var countQuery = em.createQuery(countBase + where, Long.class);
    bindParams(query, params);
    bindParams(countQuery, params);

    return toPage(query, countQuery, pageable);
  }

  // ───────────────────────── Standards ─────────────────────────
  public Page<CatalogStandardDto> searchStandards(
      String q,
      UUID curriculumId,
      UUID competencyId,
      Pageable pageable) {
    var base = """
        SELECT new com.tesis.curriculum_service.dto.catalog.CatalogStandardDto(
          s.id, s.code, s.name, s.description,
          cur.id, cur.name,
          comp.id, comp.name
        )
        FROM Standard s
        JOIN s.competency comp
        JOIN comp.curriculum cur
        """;

    var countBase = "SELECT COUNT(s.id) FROM Standard s JOIN s.competency comp JOIN comp.curriculum cur";

    var where = new StringBuilder();
    var params = new HashMap<String, Object>();

    applyTextFilter(where, params, q, List.of("s.name", "s.code", "s.description"));
    applyEqFilter(where, params, "cur.id", "curriculumId", curriculumId);
    applyEqFilter(where, params, "comp.id", "competencyId", competencyId);

    var jpql = base + where + buildOrderBy(pageable.getSort(), Map.of(
        "name", "s.name",
        "code", "s.code",
        "createdAt", "s.createdAt"), "s.name ASC, s.code ASC");

    var query = em.createQuery(jpql, CatalogStandardDto.class);
    var countQuery = em.createQuery(countBase + where, Long.class);
    bindParams(query, params);
    bindParams(countQuery, params);

    return toPage(query, countQuery, pageable);
  }

  // ───────────────────────── Objectives ─────────────────────────
  public Page<CatalogObjectiveDto> searchObjectives(
      String q,
      UUID curriculumId,
      UUID competencyId,
      UUID standardId,
      Pageable pageable) {
    var base = """
        SELECT new com.tesis.curriculum_service.dto.catalog.CatalogObjectiveDto(
          o.id, o.code, o.name, o.description,
          cur.id, cur.name,
          comp.id, comp.name,
          st.id, st.name
        )
        FROM LearningObjective o
        JOIN o.standard st
        JOIN st.competency comp
        JOIN comp.curriculum cur
        """;

    var countBase = """
        SELECT COUNT(o.id)
        FROM LearningObjective o
        JOIN o.standard st
        JOIN st.competency comp
        JOIN comp.curriculum cur
        """;

    var where = new StringBuilder();
    var params = new HashMap<String, Object>();

    applyTextFilter(where, params, q, List.of("o.name", "o.code", "o.description"));
    applyEqFilter(where, params, "cur.id", "curriculumId", curriculumId);
    applyEqFilter(where, params, "comp.id", "competencyId", competencyId);
    applyEqFilter(where, params, "st.id", "standardId", standardId);

    var jpql = base + where + buildOrderBy(pageable.getSort(), Map.of(
        "name", "o.name",
        "code", "o.code",
        "createdAt", "o.createdAt"), "o.code ASC, o.createdAt ASC");

    var query = em.createQuery(jpql, CatalogObjectiveDto.class);
    var countQuery = em.createQuery(countBase + where, Long.class);
    bindParams(query, params);
    bindParams(countQuery, params);

    return toPage(query, countQuery, pageable);
  }

  // ───────────────────────── Exercises ─────────────────────────
  public Page<CatalogExerciseDto> searchExercises(
      String q,
      UUID curriculumId,
      UUID competencyId,
      UUID standardId,
      UUID objectiveId,
      Exercise.Difficulty difficulty,
      Date from,
      Date to,
      Pageable pageable) {
    var base = """
        SELECT new com.tesis.curriculum_service.dto.catalog.CatalogExerciseDto(
          e.id,
          e.type,
          CAST(e.difficulty as string),
          SUBSTRING(e.statement, 1, 200),
          cur.id, cur.name,
          comp.id, comp.name,
          st.id, st.name,
          lo.id, lo.name
        )
        FROM Exercise e
        JOIN e.learningObjective lo
        JOIN lo.standard st
        JOIN st.competency comp
        JOIN comp.curriculum cur
        """;

    var countBase = """
        SELECT COUNT(e.id)
        FROM Exercise e
        JOIN e.learningObjective lo
        JOIN lo.standard st
        JOIN st.competency comp
        JOIN comp.curriculum cur
        """;

    var where = new StringBuilder();
    var params = new HashMap<String, Object>();

    applyTextFilter(where, params, q, List.of("e.statement", "e.type"));
    applyEqFilter(where, params, "cur.id", "curriculumId", curriculumId);
    applyEqFilter(where, params, "comp.id", "competencyId", competencyId);
    applyEqFilter(where, params, "st.id", "standardId", standardId);
    applyEqFilter(where, params, "lo.id", "objectiveId", objectiveId);
    if (difficulty != null) {
      append(where, "e.difficulty = :difficulty");
      params.put("difficulty", difficulty);
    }
    if (from != null) {
      append(where, "e.createdAt >= :from");
      params.put("from", from);
    }
    if (to != null) {
      append(where, "e.createdAt <= :to");
      params.put("to", to);
    }

    var jpql = base + where + buildOrderBy(pageable.getSort(), Map.of(
        "createdAt", "e.createdAt",
        "difficulty", "e.difficulty",
        "type", "e.type"), "e.createdAt DESC");

    var query = em.createQuery(jpql, CatalogExerciseDto.class);
    var countQuery = em.createQuery(countBase + where, Long.class);
    bindParams(query, params);
    bindParams(countQuery, params);

    return toPage(query, countQuery, pageable);
  }

  // ───────────────────────── helpers ─────────────────────────

  private static void applyTextFilter(StringBuilder where, Map<String, Object> params, String q, List<String> fields) {
    if (!StringUtils.hasText(q))
      return;
    var like = "%" + q.trim().toLowerCase() + "%";
    var parts = new ArrayList<String>();
    for (var f : fields)
      parts.add("LOWER(" + f + ") LIKE :q");
    append(where, "(" + String.join(" OR ", parts) + ")");
    params.put("q", like);
  }

  private static void applyEqFilter(StringBuilder where, Map<String, Object> params, String field, String key,
      Object value) {
    if (value == null)
      return;
    append(where, field + " = :" + key);
    params.put(key, value);
  }

  private static void append(StringBuilder where, String clause) {
    if (where.length() == 0) {
      where.append(" WHERE ").append(clause);
    } else {
      where.append(" AND ").append(clause);
    }
  }

  private static String buildOrderBy(Sort sort, Map<String, String> allowList, String fallback) {
    if (sort == null || sort.isUnsorted())
      return " ORDER BY " + fallback;
    var orders = new ArrayList<String>();
    for (Sort.Order o : sort) {
      var key = o.getProperty();
      var dir = o.getDirection().isAscending() ? "ASC" : "DESC";
      var mapped = allowList.get(key);
      if (mapped != null) {
        orders.add(mapped + " " + dir);
      }
    }
    if (orders.isEmpty())
      return " ORDER BY " + fallback;
    return " ORDER BY " + String.join(", ", orders);
  }

  private static void bindParams(TypedQuery<?> q, Map<String, Object> params) {
    params.forEach(q::setParameter);
  }

  private static <T> Page<T> toPage(TypedQuery<T> query, TypedQuery<Long> countQuery, Pageable pageable) {
    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());
    var content = query.getResultList();
    var total = countQuery.getSingleResult();
    return new PageImpl<>(content, pageable, total);
  }
}
