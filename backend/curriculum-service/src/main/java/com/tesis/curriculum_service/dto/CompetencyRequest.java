package com.tesis.curriculum_service.dto;

import jakarta.validation.constraints.NotBlank; // Importa anotación para validar que un campo no es nulo y no está vacío/solo espacios.
import jakarta.validation.constraints.NotNull; // Importa anotación para validar que un campo no es nulo.
import jakarta.validation.constraints.Size; // Importa anotación para validar la longitud de un campo.
import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos.
import lombok.Builder; // Permite usar el patrón Builder para crear instancias.
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos.

import java.util.UUID; // Para el ID del currículo padre.

/**
 * DTO (Data Transfer Object) para la creación y actualización de una entidad
 * {@link com.tesis.curriculum_service.model.Competency}.
 * Contiene los campos necesarios que el cliente enviará al servidor, incluyendo
 * el ID del currículo padre.
 * Las anotaciones de validación de Jakarta Bean Validation aseguran la
 * integridad de los datos de entrada.
 */
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para deserialización.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder.
public class CompetencyRequest {

  @NotBlank(message = "El nombre de la competencia no puede estar en blanco")
  @Size(min = 3, max = 255, message = "El nombre de la competencia debe tener entre 3 y 255 caracteres")
  private String name;

  @Size(min = 3, max = 1000, message = "Description must not exceed 1000 characters") // ✅ Propósito: Limita la longitud
                                                                                      // máxima
  // de la descripción.
  private String description;

  @NotBlank(message = "Code cannot be blank") // ✅ Propósito: El código de la competencia no puede ser nulo o vacío.
  @Size(max = 50, message = "Code must not exceed 50 characters") // ✅ Propósito: Limita la longitud máxima del código.
  private String code;

  @NotNull(message = "Curriculum ID cannot be null") // ✅ Propósito: Asegura que el ID del currículo padre no sea nulo.
  private UUID curriculumId; // ✅ Propósito: El ID del currículo al que pertenece esta competencia.
}
