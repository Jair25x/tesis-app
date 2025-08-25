package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import com.tesis.assessment_service.model.enums.AssignmentType;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AssignmentSearchCriteria {
  public AssignmentState state;
  public AssignmentType type;
  public AssignmentScope scope;
  public UUID classroomId;
  public UUID templateId;
  public OffsetDateTime windowFrom; // filtra assignments con window_start >= windowFrom
  public OffsetDateTime windowTo; // filtra assignments con window_end <= windowTo
  public Boolean mineOnly; // default true p/teacher; admin puede poner false
}
