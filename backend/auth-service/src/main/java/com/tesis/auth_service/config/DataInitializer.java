// auth-service/src/main/java/com/tesis/auth_service/config/DataInitializer.java

package com.tesis.auth_service.config;

import com.tesis.auth_service.model.ERole;
import com.tesis.auth_service.model.Role;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.RoleRepository;
import com.tesis.auth_service.repository.UserRepository;
import jakarta.annotation.PostConstruct; // Anotación que indica un método a ejecutar después de la inyección de dependencias
import lombok.RequiredArgsConstructor; // Anotación de Lombok para generar un constructor con campos 'final'
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile; // Para activar/desactivar la clase según el perfil de Spring
import org.springframework.security.crypto.password.PasswordEncoder; // ✅ NUEVA ADICIÓN: Para codificar la contraseña del usuario
import org.springframework.stereotype.Component; // Marca esta clase como un componente gestionado por Spring

import java.time.LocalDateTime;
import java.util.Arrays; // Utilidad para trabajar con arrays
import java.util.HashSet; // ✅ NUEVA ADICIÓN: Para crear un Set de roles
import java.util.Set; // ✅ NUEVA ADICIÓN: Para trabajar con Sets

/**
 * Componente de Spring que se encarga de inicializar los roles y un usuario
 * administrador
 * predeterminados en la base de datos si no existen.
 * Esta clase se activa solo en perfiles 'dev' o 'docker' para evitar
 * ejecuciones
 * no deseadas en entornos de producción.
 */
@Component // Declara esta clase como un bean de Spring.
@Profile({ "dev" }) // Se carga y ejecuta solo en perfiles "dev" o "docker".
@RequiredArgsConstructor // Genera un constructor para los campos 'final' (roleRepository,
                         // userRepository, passwordEncoder).
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository; // Inyección del repositorio de roles.
    private final UserRepository userRepository; // ✅ NUEVA ADICIÓN: Inyección del repositorio de usuarios.
    private final PasswordEncoder passwordEncoder; // ✅ NUEVA ADICIÓN: Inyección del codificador de contraseñas.

    /**
     * Método que se ejecuta automáticamente una vez que el bean DataInitializer ha
     * sido
     * construido y sus dependencias han sido inyectadas.
     * Contiene la lógica para verificar y crear los roles predeterminados y el
     * usuario administrador.
     */
    @PostConstruct // Este método se ejecuta después de la construcción del bean.
    public void initData() { // ✅ RENOMBRADO para indicar que inicializa más que solo roles
        logger.info("Inicializando roles si no existen...");

        // Itera sobre todos los valores de la enumeración ERole y los crea si no
        // existen.
        Arrays.stream(ERole.values()).forEach(roleEnum -> {
            roleRepository.findByName(roleEnum).ifPresentOrElse(
                    existing -> logger.info("Rol '{}' ya existe.", roleEnum),
                    () -> {
                        roleRepository.save(Role.builder().name(roleEnum).build());
                        logger.info("Rol '{}' creado.", roleEnum);
                    });
        });
        logger.info("Inicialización de roles completada.");

        // ✅ NUEVA ADICIÓN: Inicializar usuario 'admin' si no existe
        logger.info("Inicializando usuario 'admin' si no existe...");
        if (userRepository.findByUsername("admin").isEmpty()) {
            Set<Role> adminRoles = new HashSet<>();
            // Asegúrate de que el rol ADMIN ya existe (de la lógica anterior o de
            // migraciones)
            roleRepository.findByName(ERole.ROLE_ADMIN).ifPresent(adminRoles::add);

            if (adminRoles.isEmpty()) {
                logger.warn(
                        "El rol 'ROLE_ADMIN' no se encontró. No se pudo asignar al usuario 'admin'. Asegure que los roles estén inicializados primero.");
                // Opcional: lanzar una excepción si esto es crítico
            } else {
                User adminUser = User.builder()
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
                logger.info("Usuario 'admin' creado con éxito.");
            }
        } else {
            logger.info("Usuario 'admin' ya existe.");
        }
        logger.info("Inicialización de datos base completada.");
    }
}
