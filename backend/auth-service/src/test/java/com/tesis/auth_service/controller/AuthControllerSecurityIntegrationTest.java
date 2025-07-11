package com.tesis.auth_service.controller;

import com.tesis.auth_service.model.ERole;
import com.tesis.auth_service.model.Role;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.RoleRepository;
import com.tesis.auth_service.repository.UserRepository;
import com.tesis.auth_service.security.jwt.JwtTokenProvider;
import com.tesis.auth_service.service.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String adminToken;
    private String userToken;
    private Long testUserId;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role adminRole = roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).build());
        Role studentRole = roleRepository.save(Role.builder().name(ERole.ROLE_STUDENT).build());

        User admin = User.builder()
                .username("admin")
                .password("pass")
                .email("admin@example.com")
                .nombres("Admin")
                .apellidos("User")
                .fechaRegistro(LocalDateTime.now())
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .roles(Set.of(adminRole))
                .build();
        admin = userRepository.save(admin);

        User user = User.builder()
                .username("user")
                .password("pass")
                .email("user@example.com")
                .nombres("Normal")
                .apellidos("User")
                .fechaRegistro(LocalDateTime.now())
                .enabled(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .roles(Set.of(studentRole))
                .build();
        user = userRepository.save(user);
        testUserId = user.getId();

        adminToken = generateToken(admin);
        userToken = generateToken(user);
    }

    private String generateToken(User user) {
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        return tokenProvider.generateJwtToken(auth);
    }

    @Test
    @DisplayName("GET /api/auth/users without token returns 401")
    void listUsersUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/users with non admin token returns 403")
    void listUsersForbidden() throws Exception {
        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/auth/users with admin token returns 200")
    void listUsersOk() throws Exception {
        mockMvc.perform(get("/api/auth/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/auth/users/{id} without token returns 401")
    void deleteUserUnauthorized() throws Exception {
        mockMvc.perform(delete("/api/auth/users/{id}", testUserId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/auth/users/{id} with non admin token returns 403")
    void deleteUserForbidden() throws Exception {
        mockMvc.perform(delete("/api/auth/users/{id}", testUserId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/auth/users/{id} with admin token returns 200")
    void deleteUserOk() throws Exception {
        mockMvc.perform(delete("/api/auth/users/{id}", testUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/auth/users/reactivate/{id} without token returns 401")
    void reactivateUserUnauthorized() throws Exception {
        mockMvc.perform(put("/api/auth/users/reactivate/{id}", testUserId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/auth/users/reactivate/{id} with non admin token returns 403")
    void reactivateUserForbidden() throws Exception {
        mockMvc.perform(put("/api/auth/users/reactivate/{id}", testUserId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/auth/users/reactivate/{id} with admin token returns 200")
    void reactivateUserOk() throws Exception {
        mockMvc.perform(put("/api/auth/users/reactivate/{id}", testUserId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}
