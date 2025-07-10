package com.tesis.auth_service.security.jwt;

import com.tesis.auth_service.service.UserDetailsServiceImpl; // Necesario para cargar los detalles del usuario
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder; // Para establecer el contexto de seguridad
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource; // Para detalles adicionales de la autenticación
import org.springframework.util.StringUtils; // Utilidad para verificar si una cadena tiene texto
import org.springframework.web.filter.OncePerRequestFilter; // Garantiza que el filtro se ejecute solo una vez por solicitud

import java.io.IOException;

/**
 * Filtro personalizado que se ejecuta una vez por cada solicitud HTTP.
 * Su función es verificar si hay un token JWT válido en el encabezado de la solicitud
 * y, si es válido, autenticar al usuario en el contexto de seguridad de Spring.
 */
public class AuthTokenFilter extends OncePerRequestFilter {

    // Proveedor de JWT: se usa para validar el token y extraer el username.
    private final JwtTokenProvider jwtTokenProvider;

    // Servicio que carga los detalles del usuario a partir del username.
    private final UserDetailsServiceImpl userDetailsService;

    // Logger para registrar eventos, errores, etc.
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    // Constructor con inyección de dependencias explícita.
    public AuthTokenFilter(JwtTokenProvider jwtTokenProvider, UserDetailsServiceImpl userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Método principal que se ejecuta en cada solicitud HTTP.
     * Intenta extraer un token JWT, validarlo y autenticar al usuario si es válido.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Extrae el token JWT del encabezado "Authorization"
            String jwt = parseJwt(request);

            // Si el token existe y es válido
            if (jwt != null && jwtTokenProvider.validateJwtToken(jwt)) {
                // Extrae el nombre de usuario del token
                String username = jwtTokenProvider.getUserNameFromJwtToken(jwt);

                // Carga los detalles del usuario desde la base de datos u otra fuente
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Crea el objeto de autenticación con el usuario y sus roles
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,              // Usuario autenticado
                                null,                    // Credenciales (no necesarias porque ya está autenticado)
                                userDetails.getAuthorities() // Roles o permisos
                        );

                // Añade información adicional de la solicitud, como IP, sesión, etc.
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Guarda la autenticación en el contexto de seguridad de Spring
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Log informativo para debug
                logger.debug("Authenticated user: {}", username);
            }
        } catch (Exception e) {
            // Log de error si algo falla (token inválido, usuario no encontrado, etc.)
            logger.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        // Continúa con el siguiente filtro o controlador
        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el token JWT del encabezado "Authorization" de la solicitud.
     * Espera el formato: "Bearer <token>"
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        // Verifica que el encabezado no esté vacío y empiece con "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            // Retorna solo el token (sin el prefijo "Bearer ")
            return headerAuth.substring(7);
        }

        // Si no hay token válido, retorna null
        return null;
    }
}