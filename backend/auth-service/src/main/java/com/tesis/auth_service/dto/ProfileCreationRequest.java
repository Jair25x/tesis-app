package com.tesis.auth_service.dto; // Define el paquete del DTO

import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos
import lombok.Data; // Genera getters, setters, toString, equals y hashCode
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos

/**
 * DTO (Data Transfer Object) para encapsular los datos necesarios
 * para crear un nuevo perfil de usuario en el 'user-profile-service'.
 * Este objeto será serializado a JSON y enviado en la solicitud HTTP.
 */
@Data // Anotación de Lombok que genera automáticamente:
      // - Getters para todos los campos.
      // - Setters para todos los campos.
      // - Métodos equals(), hashCode() y toString().
@AllArgsConstructor // Anotación de Lombok que genera un constructor que toma todos los campos como
                    // argumentos.
@NoArgsConstructor // Anotación de Lombok que genera un constructor sin argumentos (necesario para
                   // la deserialización de JSON/Spring).
public class ProfileCreationRequest {
  private String username; // Nombre de usuario del nuevo perfil.
  private String nombres; // ✅ NUEVO CAMPO
  private String apellidos; // ✅ NUEVO CAMPO
  private String email; // Email del usuario (marcado como opcional en tu comentario, si lo usas).
  private String rol; // Rol o roles del usuario (ej: "ROLE_STUDENT", "ROLE_TEACHER", "ROLE_USER").
  // Puedes agregar más campos aquí en el futuro, como nombres, apellidos,
  // fecha de nacimiento, etc., si tu UserProfile lo requiere al crearse.
}