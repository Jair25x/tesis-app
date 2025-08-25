package com.tesis.assessment_service.repository.spec;

import com.tesis.assessment_service.dto.request.AssignmentSearchCriteria;
import com.tesis.assessment_service.model.AssessmentAssignment;
import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import com.tesis.assessment_service.model.enums.AssignmentType;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;
import java.util.UUID;

public final class AssignmentSpecifications {

  private AssignmentSpecifications() {
  }

  public static Specification<AssessmentAssignment> byCriteria(
      AssignmentSearchCriteria c, UUID requesterId, boolean isAdmin) {

    Specification<AssessmentAssignment> spec = Specification.where(null);

    // Si no es admin o mineOnly=true -> limitar por creador
    boolean mineOnly = c.mineOnly == null ? !isAdmin : c.mineOnly;
    if (mineOnly && requesterId != null) {
      spec = spec.and((root, q, cb) -> cb.equal(root.get("createdByUserId"), requesterId));
    }

    if (c.state != null) {
      spec = spec.and(enumEq("state", c.state));
    }
    if (c.type != null) {
      spec = spec.and(enumEq("type", c.type));
    }
    if (c.scope != null) {
      spec = spec.and(enumEq("scope", c.scope));
    }
    if (c.classroomId != null) {
      spec = spec.and((root, q, cb) -> cb.equal(root.get("classroomId"), c.classroomId));
    }
    if (c.templateId != null) {
      spec = spec.and((root, q, cb) -> cb.equal(root.get("template").get("id"), c.templateId));
    }
    if (c.windowFrom != null) {
      spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("windowStart"), c.windowFrom));
    }
    if (c.windowTo != null) {
      spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("windowEnd"), c.windowTo));
    }

    return spec;
  }

  private static <E extends Enum<E>> Specification<AssessmentAssignment> enumEq(String field, E value) {
    return (root, q, cb) -> cb.equal(root.get(field), value);
  }

  // Helpers de parseo seguro (por si los quieres usar en el controller)
  public static AssignmentState parseState(String s) {
    try {
      return s == null ? null : AssignmentState.valueOf(s.toUpperCase());
    } catch (Exception e) {
      return null;
    }
  }

  public static AssignmentType parseType(String s) {
    try {
      return s == null ? null : AssignmentType.valueOf(s.toUpperCase());
    } catch (Exception e) {
      return null;
    }
  }

  public static AssignmentScope parseScope(String s) {
    try {
      return s == null ? null : AssignmentScope.valueOf(s.toUpperCase());
    } catch (Exception e) {
      return null;
    }
  }

  public static OffsetDateTime parseDate(String s) {
    try {
      return s == null ? null : OffsetDateTime.parse(s);
    } catch (Exception e) {
      return null;
    }
  }
}
