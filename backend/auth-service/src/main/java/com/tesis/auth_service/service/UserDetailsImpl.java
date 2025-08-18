package com.tesis.auth_service.service;

import com.tesis.auth_service.model.Role;
import com.tesis.auth_service.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

@Getter
public class UserDetailsImpl implements UserDetails {

    private final Long id; // PK numérica (legacy)
    private final UUID uuid; // ⬅️ canónico para JWT
    private final String username;
    private final String password;
    private final String email;
    private final String nombres;
    private final String apellidos;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id,
            UUID uuid,
            String username,
            String password,
            String email,
            String nombres,
            String apellidos,
            boolean enabled,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.uuid = uuid;
        this.username = username;
        this.password = password;
        this.email = email;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.enabled = enabled;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User u) {
        List<SimpleGrantedAuthority> auths = u.getRoles().stream()
                .map(Role::getName) // ERole
                .map(Enum::name) // "ROLE_ADMIN" ...
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                u.getId(),
                u.getUserUuid(), // ⬅️ UUID real
                u.getUsername(),
                u.getPassword(),
                u.getEmail(),
                u.getNombres(),
                u.getApellidos(),
                u.isEnabled(),
                auths);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
