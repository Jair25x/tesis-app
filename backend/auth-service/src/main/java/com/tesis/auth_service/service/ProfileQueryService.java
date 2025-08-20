// auth-service: src/main/java/com/tesis/auth_service/service/ProfileQueryService.java
package com.tesis.auth_service.service;

import com.tesis.auth_service.dto.PublicProfileDto;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileQueryService {

  private final UserRepository userRepository;

  public List<PublicProfileDto> getPublicProfiles(List<UUID> ids) {
    if (ids == null || ids.isEmpty())
      return List.of();

    List<User> users = userRepository.findAllByUserUuidIn(ids);

    return users.stream()
        .map(u -> {
          String displayName = ((u.getNombres() == null ? "" : u.getNombres()) + " " +
              (u.getApellidos() == null ? "" : u.getApellidos()))
              .trim();
          if (displayName.isBlank())
            displayName = u.getUsername();

          return PublicProfileDto.builder()
              .id(u.getUserUuid())
              .displayName(displayName)
              .avatarUrl(u.getProfilePictureUrl())
              .build();
        })
        .collect(Collectors.toList());
  }
}
