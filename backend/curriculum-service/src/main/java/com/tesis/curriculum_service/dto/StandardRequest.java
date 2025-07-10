package com.tesis.curriculum_service.dto;

import jakarta.validation.constraints.NotBlank; // Importa anotación para validar que un campo no es nulo y no está vacío/solo espacios.
import jakarta.validation.constraints.NotNull; // Importa anotación para validar que un campo no es nulo.
import jakarta.validation.constraints.Size; // Importa anotación para validar la longitud de un campo.
import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos.
import lombok.Builder; // Permite usar el patrón Builder para crear instancias.
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos.

import java.util.UUID; // Para el ID de la competencia padre.

/**
 * DTO (Data Transfer Object) para la creación y actualización de una entidad
 * {@link com.tesis.curriculum_service.model.Standard}.
 * Contiene los campos necesarios que el cliente enviará al servidor, incluyendo
 * el ID de la competencia padre.
 * Las anotaciones de validación de Jakarta Bean Validation aseguran la
 * integridad de los datos de entrada.
 */
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para deserialización.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder.
public class StandardRequest {

  @NotBlank(message = "Name cannot be blank") // ✅ Propósito: Asegura que el nombre no sea nulo, ni una cadena vacía, ni
                                              // solo espacios en blanco.
  @Size(max = 500, message = "Name must not exceed 500 characters") // ✅ Propósito: Limita la longitud máxima del
                                                                    // nombre.
  private String name;

  @Size(max = 2000, message = "Description must not exceed 2000 characters") // ✅ Propósito: Limita la longitud máxima
                                                                             // de la descripción.
  private String description;

  @NotBlank(message = "Code cannot be blank") // ✅ Propósito: El código del estándar no puede ser nulo o vacío.
  @Size(max = 50, message = "Code must not exceed 50 characters") // ✅ Propósito: Limita la longitud máxima del código.
  private String code;

  @NotNull(message = "Competency ID cannot be null") // ✅ Propósito: Asegura que el ID de la competencia padre no sea
                                                     // nulo.
  private UUID competencyId; // ✅ Propósito: El ID de la competencia a la que pertenece este estándar.
}
