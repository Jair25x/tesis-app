// src/main/java/com/tesis/auth_service/config/AdminBootstrapRunner.java
package com.tesis.auth_service.config;

import com.tesis.auth_service.model.ERole;
import com.tesis.auth_service.model.Role;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.RoleRepository;
import com.tesis.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.ApplicationRunner;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.admin.enabled:false}")
    private boolean enabled;

    @Value("${bootstrap.admin.username:}")
    private String username;

    @Value("${bootstrap.admin.password:}")
    private String password;

    @Value("${bootstrap.admin.email:}")
    private String email;

    @Override
    public void run(org.springframework.boot.ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.warn("Admin bootstrap habilitado pero sin username/password válidos. Abortando.");
            return;
        }
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            log.info("Usuario admin '{}' ya existe. No se crea.", username);
            return;
        }
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN no existe"));

        User admin = User.builder()
                .userUuid(UUID.randomUUID())
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email == null || email.isBlank() ? null : email)
                .nombres("Administrador")
                .apellidos("Sistema")
                .fechaRegistro(LocalDateTime.now())
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .roles(Set.of(adminRole))
                .build();
        userRepository.save(admin);
        log.info("Usuario admin '{}' creado (UUID={}). Retira variables bootstrap.* del entorno.", username, admin.getUserUuid());
    }
}
