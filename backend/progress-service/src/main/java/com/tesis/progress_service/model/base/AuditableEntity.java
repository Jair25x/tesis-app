package com.tesis.progress_service.model.base;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import lombok.Getter;
import lombok.Setter;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class AuditableEntity {

  @CreatedBy
  @Column(name = "created_by", updatable = false)
  protected String createdBy;

  @LastModifiedBy
  @Column(name = "updated_by")
  protected String updatedBy;

  @Column(name = "created_at", nullable = false, updatable = false)
  protected LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  protected LocalDateTime updatedAt;

  // En progress-service NO haremos soft-delete para Attempt/SOP/Streak.
  // Si luego quieres para logros, puedes habilitar deleted_*.
  @Column(name = "deleted_at")
  protected LocalDateTime deletedAt;

  @Column(name = "deleted_by")
  protected String deletedBy;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = this.createdAt;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
