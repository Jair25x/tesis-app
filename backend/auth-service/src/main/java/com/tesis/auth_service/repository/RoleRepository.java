package com.tesis.auth_service.repository;

import com.tesis.auth_service.model.ERole;
import com.tesis.auth_service.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(ERole name);
}
