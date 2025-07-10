package com.tesis.curriculum_service.model;

import jakarta.persistence.*; // Importa todas las anotaciones JPA necesarias
import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos
import lombok.Builder; // Permite usar el patrón Builder para crear instancias
import lombok.Data; // Genera getters, setters, toString, equals y hashCode automáticamente
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos

import java.time.LocalDateTime; // Para manejar fechas y horas
import java.util.HashSet; // Para la colección de objetivos de aprendizaje
import java.util.Set; // Para la colección de objetivos de aprendizaje
import java.util.UUID; // Para usar UUIDs como IDs

/**
 * Entidad que representa un estándar de aprendizaje.
 * Un estándar desglosa una competencia y, a su vez, puede tener múltiples
 * objetivos de aprendizaje.
 */
@Entity // Indica que esta clase es una entidad JPA y se mapeará a una tabla de base de
        // datos.
@Table(name = "standards") // Especifica el nombre de la tabla en la base de datos (plural).
@Data // Anotación de Lombok para generar automáticamente getters, setters, toString,
      // equals y hashCode.
@NoArgsConstructor // Genera un constructor sin argumentos, necesario para JPA.
@AllArgsConstructor // Genera un constructor con todos los campos como argumentos.
@Builder // Permite la creación de instancias utilizando el patrón de diseño Builder.
public class Standard {

  @Id // Marca el campo 'id' como la clave primaria de la entidad.
  @GeneratedValue(strategy = GenerationType.UUID) // Genera automáticamente un UUID como ID.
  @Column(name = "id", updatable = false, nullable = false) // Mapea a la columna 'id', no actualizable y no nula.
  private UUID id;

  @Column(name = "name", nullable = false, length = 500) // Nombre o descripción breve del estándar.
  private String name;

  @Column(name = "description", columnDefinition = "TEXT") // Descripción detallada del estándar.
  private String description;

  @Column(name = "code", unique = true, length = 50) // Código único para el estándar (ej. "S.01.01").
  private String code;

  @Column(name = "created_at", nullable = false, updatable = false) // Fecha y hora de creación.
  private LocalDateTime createdAt;

  @Column(name = "updated_at") // Fecha y hora de la última actualización.
  private LocalDateTime updatedAt;

  // Relación Many-to-One con Competency: Muchos estándares pueden pertenecer a
  // una competencia.
  // '@JoinColumn(name = "competency_id", nullable = false)' especifica la columna
  // de clave foránea
  // en la tabla 'standards' que referenciará al ID de la tabla 'competencies'.
  // 'nullable = false' asegura que un estándar siempre debe estar asociado a una
  // competencia.
  @ManyToOne(fetch = FetchType.LAZY) // FetchType.LAZY mejora el rendimiento.
  @JoinColumn(name = "competency_id", nullable = false)
  private Competency competency;

  // Relación One-to-Many con LearningObjective: Un estándar puede tener muchos
  // objetivos de aprendizaje.
  // 'mappedBy = "standard"' indica que el lado propietario de la relación es el
  // campo 'standard' en la entidad LearningObjective.
  // 'cascade = CascadeType.ALL' propaga las operaciones de persistencia.
  // 'orphanRemoval = true' asegura la eliminación de objetivos si se desvinculan
  // de un estándar.
  @OneToMany(mappedBy = "standard", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default // Inicializa la colección con un HashSet vacío por defecto cuando se usa el
                   // Builder.
  private Set<LearningObjective> learningObjectives = new HashSet<>();

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
