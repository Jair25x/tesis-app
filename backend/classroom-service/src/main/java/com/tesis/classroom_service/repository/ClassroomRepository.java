package com.tesis.classroom_service.repository;

import com.tesis.classroom_service.model.Classroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, UUID> {

  Page<Classroom> findByOwnerUuid(UUID ownerUuid, Pageable pageable);

  List<Classroom> findByOwnerUuid(UUID ownerUuid);

  boolean existsByIdAndOwnerUuid(UUID id, UUID ownerUuid);

  Optional<Classroom> findByIdAndActiveTrue(UUID id);

  Page<Classroom> findByOwnerUuidAndActiveTrue(UUID ownerUuid, Pageable pageable);
}
