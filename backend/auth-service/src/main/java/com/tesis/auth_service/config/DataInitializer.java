// auth-service/src/main/java/com/tesis/auth_service/config/DataInitializer.java
package com.tesis.auth_service.config;

import com.tesis.auth_service.model.ERole;
import com.tesis.auth_service.model.Role;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.RoleRepository;
import com.tesis.auth_service.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
@Profile({ "dev" })
@RequiredArgsConstructor
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initData() {
        logger.info("Inicializando roles si no existen...");
        Arrays.stream(ERole.values()).forEach(roleEnum -> roleRepository.findByName(roleEnum).ifPresentOrElse(
                existing -> logger.info("Rol '{}' ya existe.", roleEnum),
                () -> {
                    roleRepository.save(Role.builder().name(roleEnum).build());
                    logger.info("Rol '{}' creado.", roleEnum);
                }));
        logger.info("Inicialización de roles completada.");

        // --- Usuario admin (si no existe) ---
        logger.info("Inicializando usuario 'admin' si no existe...");
        if (userRepository.findByUsername("admin").isEmpty()) {
            Set<Role> adminRoles = new HashSet<>();
            roleRepository.findByName(ERole.ROLE_ADMIN).ifPresent(adminRoles::add);

            if (adminRoles.isEmpty()) {
                logger.warn("No se encontró ROLE_ADMIN. No se pudo crear 'admin'.");
            } else {
                User adminUser = User.builder()
                        .userUuid(UUID.fromString("11111111-1111-1111-1111-111111111111")) // fijo para dev
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .email("admin@example.com")
                        .nombres("Administrador")
                        .apellidos("Principal")
                        .fechaRegistro(LocalDateTime.now())
                        .enabled(true)
                        .accountNonLocked(true)
                        .credentialsNonExpired(true)
                        .roles(adminRoles)
                        .build();
                userRepository.save(adminUser);
                logger.info("Usuario 'admin' creado con éxito (UUID={}).", adminUser.getUserUuid());
            }
        } else {
            logger.info("Usuario 'admin' ya existe.");
        }

        // --- Usuario estudiante (si no existe) ---
        logger.info("Inicializando usuario 'estudiante' si no existe...");
        if (userRepository.findByUsername("estudiante").isEmpty()) {
            Set<Role> studentRoles = new HashSet<>();
            roleRepository.findByName(ERole.ROLE_STUDENT).ifPresent(studentRoles::add);

            if (studentRoles.isEmpty()) {
                logger.warn("No se encontró ROLE_STUDENT. No se pudo crear 'estudiante'.");
            } else {
                User student = User.builder()
                        .userUuid(UUID.fromString("22222222-2222-2222-2222-222222222222")) // fijo para dev
                        .username("estudiante")
                        .password(passwordEncoder.encode("estudiante123"))
                        .email("estudiante@example.com")
                        .nombres("Estudiante")
                        .apellidos("Demo")
                        .fechaRegistro(LocalDateTime.now())
                        .enabled(true)
                        .accountNonLocked(true)
                        .credentialsNonExpired(true)
                        .roles(studentRoles)
                        .build();
                userRepository.save(student);
                logger.info("Usuario 'estudiante' creado con éxito (UUID={}).", student.getUserUuid());
            }
        } else {
            logger.info("Usuario 'estudiante' ya existe.");
        }

        logger.info("Inicialización de datos base completada.");
    }
}
