package com.tesis.auth_service.service;

import com.tesis.auth_service.dto.AdminUpdateUserRequest;
import com.tesis.auth_service.dto.ChangePasswordRequest;
import com.tesis.auth_service.dto.UpdateProfileRequest;
import com.tesis.auth_service.dto.UserProfileDto;
import com.tesis.auth_service.dto.UserSummaryDto;
import com.tesis.auth_service.model.User;

import java.util.List;

public interface UserService {
    List<UserSummaryDto> findAllUsers();

    UserSummaryDto findUserById(Long id);

    boolean existsById(Long id);

    void deleteUser(Long id);

    void reactivateUser(Long id);

    void setUserEnabled(Long id, boolean enabled);

    void changePassword(String username, ChangePasswordRequest request);

    UserSummaryDto getCurrentUserProfile(String username);

    UserProfileDto getCurrentUserProfile(User user);

    UserProfileDto getUserProfileById(Long id);

    UserSummaryDto updateCurrentUserProfile(String username, UpdateProfileRequest request);

    UserProfileDto updateUserById(Long id, AdminUpdateUserRequest request);
}