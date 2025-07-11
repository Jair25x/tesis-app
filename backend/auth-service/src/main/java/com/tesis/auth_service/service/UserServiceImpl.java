package com.tesis.auth_service.service;

import com.tesis.auth_service.dto.AdminUpdateUserRequest;
import com.tesis.auth_service.dto.ChangePasswordRequest;
import com.tesis.auth_service.dto.UpdateProfileRequest;
import com.tesis.auth_service.dto.UserProfileDto;
import com.tesis.auth_service.dto.UserSummaryDto;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder encoder;

  public UserServiceImpl(UserRepository userRepository, PasswordEncoder encoder) {
    this.userRepository = userRepository;
    this.encoder = encoder;
  }

  @Override
  public List<UserSummaryDto> findAllUsers() {
    return userRepository.findAll().stream()
        .filter(User::isEnabled) // Solo usuarios activos
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  public UserSummaryDto findUserById(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    return toDto(user);
  }

  @Override
  public UserProfileDto getUserProfileById(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));

    return getCurrentUserProfile(user);
  }

  @Transactional
  @Override
  public void deleteUser(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("No se encontró el usuario con ID: " + id));

    user.setEnabled(false); // Marcamos como inactivo
    userRepository.save(user); // Persistimos el cambio
  }

  @Override
  @Transactional
  public void reactivateUser(Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

    user.setEnabled(true);
    userRepository.save(user);
  }

  @Override
  @Transactional
  public void setUserEnabled(Long id, boolean enabled) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

    user.setEnabled(enabled);
    userRepository.save(user);
  }

  @Override
  @Transactional
  public void changePassword(String username, ChangePasswordRequest request) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

    // Validar si la contraseña actual es correcta
    if (!encoder.matches(request.getCurrentPassword(), user.getPassword())) {
      throw new IllegalArgumentException("La contraseña actual no es válida.");
    }

    // Validar si la nueva es distinta (aunque pueda parecer similar, no debe ser
    // igual)
    if (encoder.matches(request.getNewPassword(), user.getPassword())) {
      throw new IllegalArgumentException("La nueva contraseña no puede ser igual a la anterior.");
    }

    // Actualizar contraseña
    user.setPassword(encoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }

  @Override
  @Transactional
  public UserProfileDto updateUserById(Long id, AdminUpdateUserRequest request) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

    if (!user.getEmail().equalsIgnoreCase(request.getEmail())
        && userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("El correo electrónico ya está en uso por otro usuario.");
    }

    user.setNombres(request.getNombres());
    user.setApellidos(request.getApellidos());
    user.setEmail(request.getEmail());
    user.setProfilePictureUrl(request.getProfilePictureUrl());
    user.setPreferences(request.getPreferences());

    userRepository.save(user);

    return getCurrentUserProfile(user);
  }

  /**
   * Implementación del método existsById para verificar la existencia de un
   * usuario.
   * Utiliza el método existsById del UserRepository, que es eficiente para esta
   * operación.
   *
   * @param id El ID del usuario a verificar.
   * @return true si el usuario existe, false en caso contrario.
   */
  @Override
  public boolean existsById(Long id) { // <-- IMPLEMENTACIÓN DEL NUEVO MÉTODO
    return userRepository.existsById(id);
  }

  @Override
  public UserSummaryDto getCurrentUserProfile(String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    return toDto(user);
  }

  @Override
  public UserProfileDto getCurrentUserProfile(User user) {
    Set<String> roles = user.getRoles().stream()
        .map(r -> r.getName().name())
        .collect(Collectors.toSet());

    return UserProfileDto.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .nombres(user.getNombres())
        .apellidos(user.getApellidos())
        .profilePictureUrl(user.getProfilePictureUrl())
        .preferences(user.getPreferences())
        .roles(roles)
        .enabled(user.isEnabled())
        .fechaRegistro(user.getFechaRegistro())
        .build();
  }

  @Override
  @Transactional
  public UserSummaryDto updateCurrentUserProfile(String username, UpdateProfileRequest request) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

    // Validar si el nuevo email ya está en uso por otro usuario
    if (!user.getEmail().equalsIgnoreCase(request.getEmail())
        && userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("El correo electrónico ya está en uso por otro usuario.");
    }

    user.setNombres(request.getNombres());
    user.setApellidos(request.getApellidos());
    user.setEmail(request.getEmail());
    user.setProfilePictureUrl(request.getProfilePictureUrl());
    user.setPreferences(request.getPreferences());

    userRepository.save(user);

    return toDto(user);
  }

  private UserSummaryDto toDto(User user) {
    Set<String> roles = user.getRoles().stream()
        .map(r -> r.getName().name())
        .collect(Collectors.toSet());

    return new UserSummaryDto(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getProfilePictureUrl(),
        user.getPreferences(),
        roles,
        user.isEnabled(),
        user.getFechaRegistro());
  }
}