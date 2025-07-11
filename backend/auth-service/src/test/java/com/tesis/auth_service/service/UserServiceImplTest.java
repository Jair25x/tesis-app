package com.tesis.auth_service.service;

import com.tesis.auth_service.dto.AdminUpdateUserRequest;
import com.tesis.auth_service.dto.UpdateProfileRequest;
import com.tesis.auth_service.dto.UserProfileDto;
import com.tesis.auth_service.dto.UserSummaryDto;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("old@example.com")
                .nombres("Old")
                .apellidos("User")
                .profilePictureUrl("old.png")
                .preferences(new HashMap<>())
                .roles(Collections.emptySet())
                .fechaRegistro(LocalDateTime.now())
                .build();
    }

    @Test
    void updateUserByIdUpdatesPictureAndPreferences() {
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setNombres("New");
        request.setApellidos("User");
        request.setEmail("new@example.com");
        request.setProfilePictureUrl("new.png");
        request.setPreferences(Map.of("theme", "dark"));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileDto dto = userService.updateUserById(1L, request);

        assertEquals("new.png", user.getProfilePictureUrl());
        assertEquals(Map.of("theme", "dark"), user.getPreferences());
        assertEquals("new.png", dto.getProfilePictureUrl());
        assertEquals(Map.of("theme", "dark"), dto.getPreferences());
        verify(userRepository).save(user);
    }

    @Test
    void updateCurrentUserProfileUpdatesPictureAndPreferences() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setNombres("New");
        request.setApellidos("User");
        request.setEmail("new@example.com");
        request.setProfilePictureUrl("new2.png");
        request.setPreferences(Map.of("theme", "light"));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserSummaryDto dto = userService.updateCurrentUserProfile("testuser", request);

        assertEquals("new2.png", user.getProfilePictureUrl());
        assertEquals(Map.of("theme", "light"), user.getPreferences());
        assertEquals("new2.png", dto.getProfilePictureUrl());
        assertEquals(Map.of("theme", "light"), dto.getPreferences());
        verify(userRepository).save(user);
    }
}
