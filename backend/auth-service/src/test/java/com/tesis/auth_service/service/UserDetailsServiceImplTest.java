package com.tesis.auth_service.service;

import com.tesis.auth_service.model.ERole; // Importa tu enumeración de roles
import com.tesis.auth_service.model.Role; // Importa tu clase Role
import com.tesis.auth_service.model.User; // Importa tu clase User
import com.tesis.auth_service.repository.UserRepository; // Importa tu repositorio de usuarios
import org.junit.jupiter.api.BeforeEach; // Ejecuta antes de cada test
import org.junit.jupiter.api.DisplayName; // Nombres legibles para los tests
import org.junit.jupiter.api.Test; // Define un método de test
import org.junit.jupiter.api.extension.ExtendWith; // Integra Mockito con JUnit 5
import org.mockito.InjectMocks; // Inyecta mocks en la clase a probar
import org.mockito.Mock; // Crea un objeto mock
import org.mockito.junit.jupiter.MockitoExtension; // Extensión de Mockito
import org.springframework.security.core.userdetails.UserDetails; // Interfaz de Spring Security
import org.springframework.security.core.userdetails.UsernameNotFoundException; // Excepción esperada

import java.util.Collections; // Para crear sets inmutables
import java.util.HashSet; // Para crear sets mutables
import java.util.Optional; // Para simular resultados del repositorio
import java.util.Set; // Interfaz para conjuntos

import static org.junit.jupiter.api.Assertions.*; // Aserciones de JUnit (assertTrue, assertEquals, etc.)
import static org.mockito.ArgumentMatchers.anyString; // Matcher de Mockito (para cualquier String)
import static org.mockito.Mockito.when; // Para definir comportamiento de mocks

@ExtendWith(MockitoExtension.class) // Habilita Mockito para este test
class UserDetailsServiceImplTest {

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private UserRepository userRepository;

    private User testUser; // Objeto de usuario de prueba para tests básicos

    @BeforeEach
    void setUp() {
        // Configuración para el 'testUser' básico que se usa en otros tests
        Role userRole = Role.builder()
                            .id(1)
                            .name(ERole.ROLE_STUDENT)
                            .build();
        Set<Role> roles = new HashSet<>(Collections.singletonList(userRole));

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .password("encodedpassword")
                .email("email@test.com")
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .roles(roles)
                .build();
    }

    @Test
    @DisplayName("Debe cargar un usuario existente y retornar UserDetails válido")
    void shouldLoadUserByUsernameWhenUserExists() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertNotNull(userDetails, "UserDetails no debe ser nulo");
        assertEquals("testuser", userDetails.getUsername(), "El username debe coincidir");
        assertEquals("encodedpassword", userDetails.getPassword(), "La contraseña debe coincidir");
        assertTrue(userDetails.isEnabled(), "La cuenta debe estar habilitada");
        assertFalse(userDetails.getAuthorities().isEmpty(), "Debe tener roles/autoridades");
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_STUDENT")),
                "Debe contener la autoridad ROLE_STUDENT");
    }

    @Test
    @DisplayName("Debe lanzar UsernameNotFoundException si el usuario no existe")
    void shouldThrowUsernameNotFoundExceptionWhenUserDoesNotExist() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("nonexistentuser"),
                "Debe lanzar UsernameNotFoundException para usuarios no encontrados");
    }

    @Test
    @DisplayName("Debe retornar UserDetails con cuenta deshabilitada si el usuario está inactivo")
    void shouldReturnDisabledUserIfUserIsInactive() {
        testUser.setEnabled(false); // Modifica el usuario de prueba del setUp
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertFalse(userDetails.isEnabled(), "La cuenta debe estar deshabilitada si el campo 'enabled' es false");
    }


    @Test
    @DisplayName("Debe retornar UserDetails con múltiples roles correctamente")
    void shouldReturnUserDetailsWithMultipleRoles() {
        // Crear roles adicionales específicos para este test
        Role studentRole = Role.builder().id(1).name(ERole.ROLE_STUDENT).build();
        Role adminRole = Role.builder().id(2).name(ERole.ROLE_ADMIN).build();
        Set<Role> multipleRoles = new HashSet<>();
        multipleRoles.add(studentRole);
        multipleRoles.add(adminRole);

        // Crear un usuario de prueba *específico para este test*
        // Esto evita modificar el 'testUser' global y hace el test más aislado.
        User multiRoleUser = User.builder()
                .id(2L) // Usar un ID diferente si es relevante
                .username("multiroleuser")
                .password("encodedpassword")
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .roles(multipleRoles) // Asigna los múltiples roles
                .build();

        // Configurar el mock del repositorio para este usuario específico
        when(userRepository.findByUsername(multiRoleUser.getUsername())).thenReturn(Optional.of(multiRoleUser));

        // Ejecutar el método a probar
        UserDetails userDetails = userDetailsService.loadUserByUsername(multiRoleUser.getUsername());

        // Aserciones
        assertNotNull(userDetails, "UserDetails no debe ser nulo");
        assertEquals(2, userDetails.getAuthorities().size(), "Debe tener 2 autoridades");

        // Verificar que contenga ambos roles esperados
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_STUDENT")), "Debe contener ROLE_STUDENT");
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")), "Debe contener ROLE_ADMIN");
    }
}