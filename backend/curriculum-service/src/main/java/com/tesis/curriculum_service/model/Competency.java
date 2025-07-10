// curriculum-service/src/main/java/com/tesis/curriculum_service/model/Competency.java
package com.tesis.curriculum_service.model;

import jakarta.persistence.*; // Anotaciones JPA
import lombok.AllArgsConstructor; // Constructor con todos los argumentos
import lombok.Builder; // Patrón Builder para construir objetos
import lombok.Data; // Getters, Setters, toString, equals, hashCode
import lombok.NoArgsConstructor; // Constructor sin argumentos
import org.hibernate.annotations.SQLDelete; // Para Hibernate: Interceptar delete y ejecutar SQL custom
import org.hibernate.annotations.Where; // Para Hibernate: Filtrar resultados automáticamente

import java.time.LocalDateTime; // Para manejar fechas y horas
import java.util.UUID; // Para IDs únicos universales

@Entity
@Table(name = "competencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE competencies SET active = false, deleted_at = NOW() WHERE id = ?") // SQL para el borrado
                                                                                            // lógico
@org.hibernate.annotations.SQLRestriction("active = true") // Filtra automáticamente solo registros activos
public class Competency {

  @Id
  @GeneratedValue // ✅ Modificación: Quitamos @GenericGenerator para consistencia con Curriculum
  @Column(name = "id", updatable = false, nullable = false)
  private UUID id;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(nullable = false, length = 1000)
  private String description;

  @Column(nullable = false, unique = true, length = 50)
  private String code;

  @ManyToOne(fetch = FetchType.LAZY) // Relación Muchos a Uno con Curriculum
  @JoinColumn(name = "curriculum_id", nullable = false) // Columna de la clave foránea
  private Curriculum curriculum;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @Column(name = "active", nullable = false) // Campo para el borrado lógico
  @Builder.Default // Para que al usar el builder, el valor por defecto sea true
  private Boolean active = true; // Por defecto, una nueva competencia está activa

  @Column(name = "deleted_at") // Campo para registrar la fecha de borrado lógico
  private LocalDateTime deletedAt;

  @PrePersist
  protected void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
    if (this.active == null) { // Asegura que 'active' sea true al crear, aunque Builder.Default ya lo hace
      this.active = true;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
