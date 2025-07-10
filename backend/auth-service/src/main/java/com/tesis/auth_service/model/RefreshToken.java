package com.tesis.auth_service.model;

import java.time.Instant; // Importa la clase Instant para manejar fechas y horas

import jakarta.persistence.Column; // Anotación para mapear a una columna de base de datos
import jakarta.persistence.Entity; // Anotación que marca esta clase como una entidad JPA
import jakarta.persistence.GeneratedValue; // Anotación para la estrategia de generación de valores para la clave primaria
import jakarta.persistence.GenerationType; // Enumeración que define los tipos de estrategias de generación
import jakarta.persistence.Id; // Anotación que marca el campo como la clave primaria de la entidad
import jakarta.persistence.JoinColumn; // Anotación para especificar la columna JOIN para una relación de entidad
import jakarta.persistence.OneToOne; // Anotación para definir una relación uno a uno entre entidades
import jakarta.persistence.Table; // Anotación para especificar el nombre de la tabla de la base de datos

import lombok.AllArgsConstructor; // Genera un constructor con todos los argumentos
import lombok.Builder; // Permite construir objetos de manera fluida (RefreshToken.builder()..). Útil para tests y creación.
import lombok.Data; // Combina @ToString, @EqualsAndHashCode, @Getter en todos los campos, y @Setter en todos los campos no finales.
import lombok.NoArgsConstructor; // Genera un constructor sin argumentos (necesario para JPA)


@Entity // Declara que esta clase es una entidad JPA y se mapeará a una tabla de base de datos.
@Table(name = "refresh_tokens") // Especifica el nombre de la tabla en la base de datos.
@Data // Anotación de Lombok: Genera getters, setters, toString(), equals() y hashCode().
@NoArgsConstructor // Anotación de Lombok: Genera un constructor sin argumentos, necesario para JPA.
@AllArgsConstructor // Anotación de Lombok: Genera un constructor con todos los argumentos.
@Builder // Anotación de Lombok: Permite usar el patrón de diseño Builder para crear instancias de esta clase.
public class RefreshToken {

    @Id // Marca este campo como la clave primaria de la entidad.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Configura la generación de la clave primaria para ser autoincremental por la base de datos.
    private Long id; // Identificador único para el token de refresco.

    @OneToOne // Define una relación uno a uno con la entidad User.
              // En este caso, un RefreshToken está asociado a un único User.
              // Por defecto, esta relación es Lazy Loading.
    @JoinColumn(name = "user_id", referencedColumnName = "id") // Especifica la columna de unión en la tabla 'refresh_tokens'.
                                                              // 'user_id' es la columna en 'refresh_tokens' que referencia al 'id' de la tabla 'users'.
    private User user; // Referencia al usuario asociado con este token de refresco.

    @Column(nullable = false, unique = true) // Mapea este campo a una columna en la base de datos.
                                            // 'nullable = false' indica que el campo no puede ser nulo.
                                            // 'unique = true' asegura que no haya dos RefreshTokens con el mismo valor de token.
    private String token; // El valor real del token de refresco (una cadena aleatoria y única).

    @Column(nullable = false) // Mapea este campo a una columna en la base de datos.
                              // 'nullable = false' indica que el campo no puede ser nulo.
    private Instant expiryDate; // La fecha y hora en que este token de refresco expira. Se usa Instant para UTC.

    /**
     * Método auxiliar para verificar si el token de refresco ha expirado.
     * Es útil para la lógica de negocio en el servicio.
     * @return true si la fecha de expiración es anterior al momento actual, false en caso contrario.
     */
    public boolean isExpired() {
        return this.expiryDate.isBefore(Instant.now());
    }
}