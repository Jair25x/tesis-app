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

/**
 * Entidad JPA que representa un Currículo escolar.
 * Utiliza soft delete para preservar la información en lugar de eliminarla
 * físicamente.
 */
@Entity // Marca la clase como una entidad JPA mapeada a una tabla de base de datos.
@Table(name = "curricula") // Define el nombre de la tabla en la base de datos.
@Data // Anotación de Lombok: Genera getters, setters, toString(), equals() y
      // hashCode().
@NoArgsConstructor // Anotación de Lombok: Genera un constructor sin argumentos.
@AllArgsConstructor // Anotación de Lombok: Genera un constructor con todos los argumentos.
@Builder // Anotación de Lombok: Permite construir instancias de la clase usando el
         // patrón Builder.
@SQLDelete(sql = "UPDATE curricula SET active = false WHERE id = ?") // ✅ MODIFICACIÓN CLAVE: Intercepta las operaciones
                                                                     // de DELETE
                                                                     // y en su lugar ejecuta un UPDATE para marcar
                                                                     // 'active' como falso.
@org.hibernate.annotations.SQLRestriction("active = true") // ✅ MODIFICACIÓN CLAVE: FILTRA AUTOMÁTICAMENTE todas las
                                                           // consultas SELECT
// para incluir solo los registros donde 'active' es TRUE.
// Esto asegura que los currículos "borrados" lógicamente no aparezcan en
// búsquedas normales.
public class Curriculum {

  @Id // Marca el campo como la clave primaria de la entidad.
  @GeneratedValue // Permite que el proveedor de persistencia genere el valor de la clave
                  // primaria.
  private UUID id; // Identificador único del currículo.

  @Column(nullable = false, unique = true) // Columna no nula y única.
  private String name; // Nombre del currículo.

  @Column(nullable = true) // Columna opcional.
  private String description; // Descripción del currículo.

  @Column(nullable = false, unique = true) // Columna no nula y única.
  private String code; // Código único del currículo.

  @Column(nullable = false) // Columna no nula.
  private String grade; // Grado escolar al que aplica el currículo (ej., "1er grado", "Secundaria").

  @Column(nullable = false, updatable = false) // No nulo y no actualizable después de la creación.
  private LocalDateTime createdAt; // Fecha y hora de creación del registro.

  @Column(nullable = false) // No nulo.
  private LocalDateTime updatedAt; // Fecha y hora de la última actualización del registro.

  @Column(nullable = false)
  @Builder.Default // ✅ NUEVO CAMPO: Por defecto, un currículo recién creado está activo.
  private Boolean active = true; // Indica si el currículo está activo (true) o ha sido borrado lógicamente
                                 // (false).

  @Column(nullable = true) // ✅ NUEVO CAMPO (opcional): Fecha y hora en que el currículo fue lógicamente
                           // eliminado.
  private LocalDateTime deletedAt; // Se usará cuando 'active' se establezca en 'false'.

  /**
   * Callback que se ejecuta antes de persistir (insertar) un nuevo registro.
   * Establece `createdAt` y `updatedAt` a la fecha y hora actuales.
   */
  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    active = true; // Asegura que active sea true al crear
  }

  /**
   * Callback que se ejecuta antes de actualizar un registro existente.
   * Actualiza `updatedAt` a la fecha y hora actuales.
   */
  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
