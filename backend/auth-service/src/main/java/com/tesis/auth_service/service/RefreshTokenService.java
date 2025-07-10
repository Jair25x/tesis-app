package com.tesis.auth_service.service;

import com.tesis.auth_service.exception.TokenRefreshException;
import com.tesis.auth_service.model.RefreshToken;
import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.RefreshTokenRepository;
import com.tesis.auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${jwt.refreshExpirationMs}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Crea un nuevo RefreshToken para un usuario, o actualiza uno existente si ya
     * lo tiene.
     * Esto evita violaciones de unicidad en la base de datos para la relación
     * user_id.
     * 
     * @param userId El ID del usuario para el que se gestiona el RefreshToken.
     * @return El RefreshToken creado o actualizado.
     */
    @Transactional // Asegura que la operación sea atómica.
    public RefreshToken createOrUpdateRefreshToken(Long userId) { // ✅ NOMBRE DEL MÉTODO CAMBIADO
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));

        // Intenta encontrar un RefreshToken existente para este usuario
        Optional<RefreshToken> existingRefreshTokenOptional = refreshTokenRepository.findByUser(user);

        RefreshToken refreshToken;
        if (existingRefreshTokenOptional.isPresent()) {
            // Si ya existe un token, lo actualizamos.
            // Esto es más eficiente y evita problemas de unicidad que un delete + insert.
            refreshToken = existingRefreshTokenOptional.get();
            refreshToken.setToken(UUID.randomUUID().toString()); // Generamos un nuevo valor de token para invalidar el
                                                                 // anterior
            refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs)); // Actualizamos la fecha de
                                                                                          // expiración
        } else {
            // Si no existe, creamos una nueva instancia de RefreshToken.
            refreshToken = RefreshToken.builder()
                    .user(user)
                    .token(UUID.randomUUID().toString())
                    .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                    .build();
        }
        // Guardamos el token. Si es uno existente con ID, JPA lo actualizará. Si es
        // nuevo, lo insertará.
        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.isExpired()) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(),
                    "El token ha expirado. Por favor inicia sesión nuevamente.");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));

        return refreshTokenRepository.deleteByUser(user);
    }

    @Transactional
    public void deleteAll() {
        refreshTokenRepository.deleteAll();
    }

    @Transactional
    public void deleteByToken(String tokenValue) {
        refreshTokenRepository.findByToken(tokenValue)
                .ifPresent(refreshTokenRepository::delete);
    }

    public boolean existsByToken(String token) {
        return refreshTokenRepository.findByToken(token).isPresent();
    }
}
