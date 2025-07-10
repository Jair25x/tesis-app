package com.tesis.curriculum_service.model;

import jakarta.persistence.*; // Importa todas las anotaciones JPA necesarias
import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos
import lombok.Builder; // Permite usar el patrón Builder para crear instancias
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos

import java.time.LocalDateTime; // Para manejar fechas y horas
import java.util.UUID; // Para usar UUIDs como IDs

/**
 * Entidad que representa un objetivo de aprendizaje específico.
 * Un objetivo de aprendizaje desglosa un estándar y es el nivel más granular de
 * la jerarquía del currículo.
 */
@Entity // Indica que esta clase es una entidad JPA y se mapeará a una tabla de base de
        // datos.
@Table(name = "learning_objectives") // Especifica el nombre de la tabla en la base de datos (plural).
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para JPA.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder.
public class LearningObjective {

  @Id // Marca el campo 'id' como la clave primaria de la entidad.
  @GeneratedValue(strategy = GenerationType.UUID) // Genera automáticamente un UUID como ID.
  @Column(name = "id", updatable = false, nullable = false) // Mapea a la columna 'id', no actualizable y no nula.
  private UUID id;

  @Column(name = "name", nullable = false, columnDefinition = "TEXT") // Descripción del objetivo de aprendizaje.
  private String name;

  @Column(name = "description", columnDefinition = "TEXT") // ✅ AGREGADO: Descripción detallada del objetivo de
                                                           // aprendizaje.
  private String description;

  @Column(name = "code", unique = true, length = 50) // Código único para el objetivo (ej. "LO.01.01.01").
  private String code;

  @Column(name = "created_at", nullable = false, updatable = false) // Fecha y hora de creación.
  private LocalDateTime createdAt;

  @Column(name = "updated_at") // Fecha y hora de la última actualización.
  private LocalDateTime updatedAt;

  // Relación Many-to-One con Standard: Muchos objetivos de aprendizaje pueden
  // pertenecer a un estándar.
  // '@JoinColumn(name = "standard_id", nullable = false)' especifica la columna
  // de clave foránea
  // en la tabla 'learning_objectives' que referenciará al ID de la tabla
  // 'standards'.
  // 'nullable = false' asegura que un objetivo de aprendizaje siempre debe estar
  // asociado a un estándar.
  @ManyToOne(fetch = FetchType.LAZY) // FetchType.LAZY mejora el rendimiento.
  @JoinColumn(name = "standard_id", nullable = false)
  private Standard standard;

  /**
   * Método de callback de JPA que se ejecuta antes de persistir la entidad por
   * primera vez.
   * Se usa para establecer automáticamente la fecha de creación.
   */
  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  /**
   * Método de callback de JPA que se ejecuta antes de actualizar la entidad.
   * Se usa para establecer automáticamente la fecha de última actualización.
   */
  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
