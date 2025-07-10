package com.tesis.auth_service.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper; // Necesario para convertir Map a JSON
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType; // Para especificar el Content-Type de la respuesta
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Este componente de Spring Security maneja las excepciones de autenticación.
 * Se invoca cuando un usuario no autenticado intenta acceder a un recurso protegido,
 * o cuando un token JWT presentado no es válido o está ausente.
 * Devuelve una respuesta JSON estandarizada con el código de estado HTTP 401 Unauthorized.
 */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    /**
     * Este método es llamado por Spring Security para iniciar el proceso de "autenticación"
     * cuando un usuario no autenticado intenta acceder a un recurso que requiere autenticación.
     * En nuestro caso, genera una respuesta HTTP 401 (No Autorizado) en formato JSON.
     *
     * @param request La solicitud HTTP que causó la excepción.
     * @param response La respuesta HTTP a la que se le escribirá la información del error.
     * @param authException La excepción de autenticación que ocurrió (ej. Credenciales incorrectas, token inválido).
     * @throws IOException Si ocurre un error de E/S al escribir la respuesta.
     * @throws ServletException Si ocurre un error a nivel de Servlet.
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException, ServletException {
        // Registra el error de autenticación para depuración.
        logger.error("Unauthorized error: {}", authException.getMessage());

        // Establece el tipo de contenido de la respuesta a JSON.
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // Establece el código de estado HTTP a 401 Unauthorized.
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        // Prepara el cuerpo de la respuesta JSON con detalles del error.
        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", authException.getMessage()); // El mensaje de la excepción de autenticación
        body.put("path", request.getServletPath()); // La ruta de la solicitud que fue denegada

        // Convierte el mapa a una cadena JSON y lo escribe en el flujo de salida de la respuesta.
        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), body);
    }
}
