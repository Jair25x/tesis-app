package com.tesis.auth_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users") // Nombre de tabla diferente a 'user' para evitar conflictos SQL
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Contraseña encriptada

    @Column(nullable = true)
    private String email; // Correo electronico opcional

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(nullable = false)
    private String nombres;

    @Column(nullable = false)
    private String apellidos;

    private boolean enabled = true; // Por defecto habilitado
    private boolean accountNonLocked = true; // Por defecto no bloqueado
    private boolean credentialsNonExpired = true; // Por defecto credenciales no expiradas

    @ManyToMany(fetch = FetchType.EAGER) // Cargar roles junto con el usuario
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
}