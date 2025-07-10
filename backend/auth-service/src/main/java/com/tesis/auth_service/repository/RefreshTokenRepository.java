package com.tesis.auth_service.repository;

import com.tesis.auth_service.model.RefreshToken; // Importa la entidad RefreshToken
import com.tesis.auth_service.model.User;         // Importa la entidad User (para la relación con RefreshToken)
import org.springframework.data.jpa.repository.JpaRepository; // Interfaz base de Spring Data JPA
import org.springframework.stereotype.Repository; // Opcional, pero buena práctica para indicar que es un componente de repositorio

import java.util.Optional; // Importa Optional para manejar resultados que pueden ser nulos

// Anotación opcional pero recomendada para indicar que esta interfaz es un componente de persistencia.
@Repository 
// Define la interfaz del repositorio para la entidad RefreshToken.
// Extiende JpaRepository, que proporciona métodos CRUD básicos (Create, Read, Update, Delete).
// <RefreshToken, Long> indica que este repositorio gestiona entidades de tipo RefreshToken
// y que el tipo de su clave primaria es Long.
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Busca un RefreshToken por su valor de cadena.
     * Spring Data JPA automáticamente implementará este método basándose en su nombre.
     * @param token El valor de cadena único del RefreshToken.
     * @return Un Optional que contiene el RefreshToken si se encuentra, o un Optional vacío si no existe.
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Elimina un RefreshToken de la base de datos asociado a un usuario específico.
     * Esto es útil para la revocación de tokens, por ejemplo, cuando un usuario cierra sesión
     * o cambia su contraseña y se desea invalidar cualquier token de refresco existente.
     * @param user La entidad User cuyo RefreshToken se desea eliminar.
     * @return La cantidad de registros eliminados (normalmente 0 o 1).
     */
    // Cuando este método es llamado, necesitas que se ejecute dentro de una transacción.
    // Esto se maneja típicamente en el servicio que invoca este método (con @Transactional).
    int deleteByUser(User user);

    // Spring Data JPA puede inferir este método porque "user" es un campo en tu entidad RefreshToken.
    Optional<RefreshToken> findByUser(User user);

    void deleteByToken(String token);
}
