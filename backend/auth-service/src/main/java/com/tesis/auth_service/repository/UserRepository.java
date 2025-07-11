package com.tesis.auth_service.repository;

import com.tesis.auth_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByEnabledTrue(); // Para listar usuarios activos

    Optional<User> findByUsernameAndEnabledTrue(String username); // Para login y validaciones

    long countByEnabledTrue(); // Para contar los usuarios con enabled en true
}
