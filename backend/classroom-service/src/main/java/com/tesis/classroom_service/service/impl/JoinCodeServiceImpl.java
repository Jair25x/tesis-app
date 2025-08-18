package com.tesis.classroom_service.service.impl;

import com.tesis.classroom_service.dto.request.GenerateJoinCodeRequest;
import com.tesis.classroom_service.dto.request.JoinRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.JoinCodeDto;
import com.tesis.classroom_service.exception.BadRequestException;
import com.tesis.classroom_service.exception.ConflictException;
import com.tesis.classroom_service.exception.ForbiddenException;
import com.tesis.classroom_service.exception.NotFoundException;
import com.tesis.classroom_service.model.Classroom;
import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.JoinCode;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.repository.ClassroomMemberRepository;
import com.tesis.classroom_service.repository.ClassroomRepository;
import com.tesis.classroom_service.repository.JoinCodeRepository;
import com.tesis.classroom_service.service.JoinCodeService;
import com.tesis.classroom_service.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JoinCodeServiceImpl implements JoinCodeService {

  private final ClassroomRepository classroomRepository;
  private final ClassroomMemberRepository memberRepository;
  private final JoinCodeRepository joinCodeRepository;
  private final CodeGenerator codeGenerator;

  @Value("${classroom.join-code.length:6}")
  private int defaultLength;

  @Value("${classroom.join-code.ttl-minutes:1440}")
  private int defaultTtlMinutes;

  // -------------------------
  // Teacher: manage codes
  // -------------------------

  @Override
  @Transactional
  public JoinCodeDto generate(UUID classroomId, UUID ownerUuid, GenerateJoinCodeRequest req) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    ensureOwner(c, ownerUuid);

    // revoca el activo anterior (si existe)
    joinCodeRepository.findFirstByClassroomIdAndRevokedFalseOrderByCreatedAtDesc(classroomId)
        .ifPresent(jc -> {
          jc.setRevoked(true);
          joinCodeRepository.save(jc);
        });

    int ttl = (req != null && req.getTtlMinutes() != null && req.getTtlMinutes() > 0)
        ? req.getTtlMinutes()
        : defaultTtlMinutes;

    Integer maxUses = (req != null) ? req.getMaxUses() : null;

    String code = codeGenerator.generate(defaultLength).toUpperCase(Locale.ROOT).trim();

    JoinCode jc = JoinCode.builder()
        .classroomId(classroomId)
        .code(code)
        .expiresAt(LocalDateTime.now().plusMinutes(ttl))
        .maxUses(maxUses)
        .usedCount(0)
        .revoked(false)
        .build();

    jc = joinCodeRepository.save(jc);

    return toDto(jc);
  }

  @Override
  @Transactional(readOnly = true)
  public JoinCodeDto getActive(UUID classroomId, UUID ownerUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));
    ensureOwner(c, ownerUuid);

    JoinCode jc = joinCodeRepository.findFirstByClassroomIdAndRevokedFalseOrderByCreatedAtDesc(classroomId)
        .orElseThrow(() -> new NotFoundException("No hay un código activo para este aula"));

    if (jc.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new NotFoundException("El código activo ya expiró");
    }
    return toDto(jc);
  }

  @Override
  @Transactional
  public void revoke(UUID classroomId, UUID ownerUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));
    ensureOwner(c, ownerUuid);

    joinCodeRepository.findFirstByClassroomIdAndRevokedFalseOrderByCreatedAtDesc(classroomId)
        .ifPresent(jc -> {
          jc.setRevoked(true);
          joinCodeRepository.save(jc);
        });
  }

  // -------------------------
  // Student: join by code
  // -------------------------

  @Override
  @Transactional
  public ClassroomDetailDto join(UUID studentUuid, JoinRequest req) {
    if (req == null || req.getCode() == null) {
      throw new BadRequestException("Código requerido");
    }

    String raw = req.getCode().trim().toUpperCase(Locale.ROOT);
    if (raw.isBlank())
      throw new BadRequestException("Código inválido");

    JoinCode jc = joinCodeRepository.findByCode(raw)
        .orElseThrow(() -> new NotFoundException("Código no válido"));

    if (Boolean.TRUE.equals(jc.getRevoked())) {
      throw new NotFoundException("Código no válido (revocado)");
    }
    if (jc.getExpiresAt() == null || jc.getExpiresAt().isBefore(LocalDateTime.now())) {
      throw new NotFoundException("Código expirado");
    }

    Classroom c = classroomRepository.findById(jc.getClassroomId())
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    if (!Boolean.TRUE.equals(c.getActive())) {
      throw new NotFoundException("El aula no está disponible");
    }

    // Idempotencia: si ya es miembro, no consumas uso y devuelve detalles
    if (memberRepository.existsByClassroomIdAndUserUuid(c.getId(), studentUuid)) {
      return toDetailDto(c);
    }

    // Consume uso (si corresponde) de forma atómica
    if (jc.getMaxUses() != null) {
      int updated = joinCodeRepository.tryConsume(jc.getId(), LocalDateTime.now());
      if (updated == 0) {
        throw new ConflictException("El código ya no tiene usos disponibles");
      }
    }

    // Crea membresía
    ClassroomMember m = ClassroomMember.builder()
        .classroomId(c.getId())
        .userUuid(studentUuid)
        .role(MemberRole.STUDENT)
        .joinedAt(LocalDateTime.now())
        .build();
    memberRepository.save(m);

    return toDetailDto(c);
  }

  // -------------------------
  // Helpers
  // -------------------------

  private void ensureOwner(Classroom c, UUID ownerUuid) {
    if (!c.getOwnerUuid().equals(ownerUuid) && !com.tesis.classroom_service.util.SecurityUtils.isAdmin()) {
      throw new com.tesis.classroom_service.exception.ForbiddenException(
          "Sólo el owner o ADMIN puede gestionar el código de ingreso");
    }
  }

  private JoinCodeDto toDto(JoinCode jc) {
    Integer remaining = (jc.getMaxUses() == null) ? null : (jc.getMaxUses() - jc.getUsedCount());
    if (remaining != null && remaining < 0)
      remaining = 0;

    return JoinCodeDto.builder()
        .code(jc.getCode())
        .expiresAt(jc.getExpiresAt())
        .maxUses(jc.getMaxUses())
        .usedCount(jc.getUsedCount())
        .remainingUses(remaining)
        .build();
  }

  private ClassroomDetailDto toDetailDto(Classroom c) {
    return ClassroomDetailDto.builder()
        .id(c.getId())
        .ownerUuid(c.getOwnerUuid())
        .name(c.getName())
        .description(c.getDescription())
        .grade(c.getGrade())
        .subject(c.getSubject())
        .active(Boolean.TRUE.equals(c.getActive()))
        .createdAt(c.getCreatedAt())
        .updatedAt(c.getUpdatedAt())
        .build();
  }
}
