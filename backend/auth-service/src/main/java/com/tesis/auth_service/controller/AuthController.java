package com.tesis.auth_service.controller;

import com.tesis.auth_service.AuthServiceApplication;
import com.tesis.auth_service.dto.AdminUpdateUserRequest;
import com.tesis.auth_service.dto.ChangePasswordRequest;
// Importaciones para Data Transfer Objects (DTOs) que representan las estructuras de datos de entrada y salida
import com.tesis.auth_service.dto.JwtResponse;
import com.tesis.auth_service.dto.LoginRequest;
import com.tesis.auth_service.dto.LogoutRequest;
import com.tesis.auth_service.dto.RegisterRequest;
import com.tesis.auth_service.dto.TokenRefreshRequest; // NUEVO: DTO para la solicitud de refresh token
import com.tesis.auth_service.dto.TokenRefreshResponse; // NUEVO: DTO para la respuesta de refresh token
import com.tesis.auth_service.dto.UpdateProfileRequest;
import com.tesis.auth_service.dto.UserProfileDto;
import com.tesis.auth_service.dto.UserStatsDto;
import com.tesis.auth_service.dto.UserSummaryDto;
import com.tesis.auth_service.exception.ErrorResponse;
import com.tesis.auth_service.exception.RoleNotFoundException;
import com.tesis.auth_service.exception.TokenRefreshException; // NUEVO: Tu excepción personalizada de refresh token
// Importaciones para los modelos de entidad de la base de datos
import com.tesis.auth_service.model.ERole; // Enumeración de roles (ADMIN, TEACHER, STUDENT)
import com.tesis.auth_service.model.RefreshToken; // NUEVO: Entidad RefreshToken
import com.tesis.auth_service.model.Role; // Entidad de rol
import com.tesis.auth_service.model.User; // Entidad de usuario
// Importaciones de repositorios para interactuar con la base de datos
import com.tesis.auth_service.repository.RoleRepository;
import com.tesis.auth_service.repository.UserRepository;
// Importaciones de componentes de seguridad
import com.tesis.auth_service.security.jwt.JwtTokenProvider; // Para generar y validar JWTs
import com.tesis.auth_service.service.RefreshTokenService; // NUEVO: Servicio para la lógica de RefreshToken
import com.tesis.auth_service.service.UserDetailsImpl; // Implementación de UserDetails de Spring Security
import com.tesis.auth_service.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
// Importaciones de Spring y Jakarta para validación, manejo HTTP y seguridad
import jakarta.validation.Valid; // Para la validación automática de los DTOs usando anotaciones como @NotBlank, @Size
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus; // Para códigos de estado HTTP (ej. OK, CONFLICT, CREATED)
import org.springframework.http.ResponseEntity; // Para construir respuestas HTTP
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager; // Componente de Spring Security para autenticar usuarios
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // Token para autenticación basada en usuario/contraseña
import org.springframework.security.core.Authentication; // Representa una autenticación de usuario
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder; // Contenedor para el objeto Authentication de la aplicación
import org.springframework.security.crypto.password.PasswordEncoder; // Interfaz para codificar contraseñas
import org.springframework.web.bind.annotation.*; // Anotaciones de Spring Web para controladores REST
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*; // Utilidades generales como Set, HashSet
import java.util.stream.Collectors; // Para operar con Streams de Java 8+

/**
 * REST controller for managing user authentication and registration.
 * This controller exposes endpoints for clients to interact with the
 * authentication system.
 */
// @CrossOrigin(origins = "*", maxAge = 3600) // CORS configuration: allows
// requests from any origin.
// In a production environment, this should be more restrictive (e.g., specify
// domains).
@RestController // Indicates that this class is a Spring controller that handles REST requests.
@RequestMapping("/api/auth") // Maps all requests starting with "/api/auth" to the methods of this
                             // controller.
@Tag(name = "Authentication and Authorization", description = "Endpoints for user management, login, registration, and access/refresh tokens.")
public class AuthController {

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class); // Logger for logging events.

  // Dependency Injection via constructor (Excellent practice!)
  // This makes dependencies clear and mandatory for controller creation.
  private final AuthenticationManager authenticationManager;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder encoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final RefreshTokenService refreshTokenService; // Inject RefreshTokenService
  private final UserService userService;

  /**
   * Controller constructor, where Spring will automatically inject all necessary
   * dependencies.
   */
  public AuthController(AuthenticationManager authenticationManager,
      UserRepository userRepository,
      RoleRepository roleRepository,
      PasswordEncoder encoder,
      JwtTokenProvider jwtTokenProvider,
      RefreshTokenService refreshTokenService,
      UserService userService) {
    this.authenticationManager = authenticationManager;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.encoder = encoder;
    this.jwtTokenProvider = jwtTokenProvider;
    this.refreshTokenService = refreshTokenService;
    this.userService = userService;
  }

  /**
   * Endpoint for user authentication (login).
   *
   * Receives user credentials, authenticates them, and if valid,
   * generates a JSON Web Token (JWT) and returns it along with user details
   * and a Refresh Token.
   *
   * @param loginRequest Object {@link LoginRequest} containing the username and
   *                     password.
   * @return {@link ResponseEntity} containing the {@link JwtResponse} with the
   *         token, refresh token, and user details,
   *         or an error if authentication fails.
   */
  @Operation(summary = "User Login", description = "Authenticates an existing user and returns a JWT (Access Token) along with a Refresh Token and user details.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Login successful. Access Token and Refresh Token are returned.", content = @Content(schema = @Schema(implementation = JwtResponse.class))),
      @ApiResponse(responseCode = "401", description = "Invalid credentials (incorrect username or password, or disabled account).", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "400", description = "Malformed login request (e.g., empty fields).", content = @Content(schema = @Schema(implementation = Map.class)))
  })
  @PostMapping("/login") // Maps POST requests to /api/auth/login.
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    // 1. Authenticate the user:
    Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

    // 2. Set authentication in the SecurityContext:
    SecurityContextHolder.getContext().setAuthentication(authentication);

    // 3. Generate the JWT (Access Token):
    String jwt = jwtTokenProvider.generateJwtToken(authentication);

    // 4. Get user details:
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

    // 5. Extract user roles:
    List<String> roles = userDetails.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());

    // 6. ✅ MODIFICATION: Call the new method to create or update the Refresh Token
    RefreshToken refreshToken = refreshTokenService.createOrUpdateRefreshToken(userDetails.getId()); // ✅ CHANGE HERE

    // 7. Return the JWT response with the Access Token and Refresh Token:
    return ResponseEntity.ok(
        new JwtResponse(jwt, refreshToken.getToken(), "Bearer",
            userDetails.getId(),
            userDetails.getUsername(),
            roles,
            userDetails.getEmail(),
            userDetails.getNombres(),
            userDetails.getApellidos()));
  }

  /**
   * Endpoint para el registro de nuevos usuarios.
   *
   * Recibe los datos de registro del nuevo usuario, valida su unicidad (nombre de
   * usuario y correo electrónico),
   * encripta la contraseña, asigna roles y guarda el usuario (con su perfil base)
   * en la base de datos.
   * La creación del perfil de usuario ahora se maneja de forma interna dentro de
   * este mismo microservicio.
   *
   * @param registerRequest Objeto {@link RegisterRequest} con los datos del nuevo
   *                        usuario.
   * @return {@link ResponseEntity} con un mensaje de éxito si el registro es
   *         exitoso, o un error si el
   *         nombre de usuario o correo electrónico ya están en uso, o si la
   *         solicitud es malformada.
   */
  @Operation(summary = "Register a new user", description = "Creates a new user account. Roles can be specified; if not, 'ROLE_STUDENT' is assigned by default. User profile creation is now handled internally within this service.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "User registered and profile created successfully.", content = @Content(schema = @Schema(implementation = String.class))), // Cambiado
                                                                                                                                                                                  // a
                                                                                                                                                                                  // String
      @ApiResponse(responseCode = "409", description = "Username or Email is already in use.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "400", description = "Malformed registration request (e.g., invalid fields, invalid role).", content = @Content(schema = @Schema(implementation = Map.class))) // MethodArgumentNotValidException
  })
  @PostMapping("/register") // Maps POST requests to /api/auth/register.
  public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
    // 1. Check if the username is already in use:
    if (userRepository.existsByUsername(registerRequest.getUsername())) {
      logger.warn("Attempt to register with existing username: {}", registerRequest.getUsername());
      return ResponseEntity
          .status(HttpStatus.CONFLICT) // HTTP status code 409 Conflict.
          .body(new ErrorResponse("Username is already in use.",
              HttpStatus.CONFLICT.value(),
              System.currentTimeMillis())); // Error message for the client.
    }
    // 1.1. Added email verification
    if (userRepository.existsByEmail(registerRequest.getEmail())) {
      logger.warn("Attempt to register with already registered email: {}", registerRequest.getEmail());
      return ResponseEntity
          .status(HttpStatus.CONFLICT)
          .body(new ErrorResponse("Email is already in use.",
              HttpStatus.CONFLICT.value(),
              System.currentTimeMillis()));
    }

    // 2. Create a new User instance:
    User user = User.builder()
        .username(registerRequest.getUsername())
        .password(encoder.encode(registerRequest.getPassword())) // Password encryption here!
        .email(registerRequest.getEmail()) // Email registration
        .nombres(registerRequest.getNombres())
        .apellidos(registerRequest.getApellidos())
        .profilePictureUrl(registerRequest.getProfilePictureUrl())
        .preferences(registerRequest.getPreferences())
        .fechaRegistro(LocalDateTime.now())
        .enabled(true) // Account enabled
        .accountNonLocked(true) // Account not locked
        .credentialsNonExpired(true) // Credentials not expired
        .build();

    // 3. Resolve and assign roles to the user:
    Set<Role> roles = resolveRoles(registerRequest.getRole());
    user.setRoles(roles);

    // 4. Save the new user to the database:
    userRepository.save(user);
    logger.info("User registered successfully: {}", registerRequest.getUsername());

    // --- Lógica de creación de perfil ahora es INTERNA ---
    // Dado que auth-service y user-profile-service se consolidaron,
    // la creación del perfil es parte del mismo proceso de guardado del usuario.
    // El modelo 'User' ahora contiene toda la información de perfil necesaria.
    // No se necesita una llamada a un ProfileClient externo.

    // 5. Return a success response:
    // El registro de usuario y la creación de su perfil base se consideran exitosos
    // una vez que el usuario es guardado en la base de datos.
    return new ResponseEntity<>("User registered and profile created successfully.", HttpStatus.CREATED);
  }

  /**
   * Auxiliary method to resolve user roles.
   * Converts role names in String (received from the client) to {@link Role}
   * entities.
   * Assigns a default role (STUDENT) if no roles are specified or if an invalid
   * role is specified.
   *
   * @param strRoles A {@link Set} of strings representing role names (e.g.,
   *                 "admin", "teacher", "student").
   * @return A {@link Set} of corresponding {@link Role} entities.
   * @throws RuntimeException If a fundamental role (ADMIN, TEACHER, STUDENT) is
   *                          not
   *                          found in the database (this indicates a problem with
   *                          data initialization).
   */
  private Set<Role> resolveRoles(Set<String> strRoles) {
    Set<Role> roles = new HashSet<>();

    // If no roles are specified in the request or the list is empty, assign
    // ROLE_STUDENT by default.
    if (strRoles == null || strRoles.isEmpty()) {
      logger.debug("No roles specified in the registration. Assigning ROLE_STUDENT by default.");
      roles.add(findRole(ERole.ROLE_STUDENT));
    } else {
      // Iterate over the role names provided in the request.
      for (String roleStr : strRoles) {
        logger.debug("Processing received role: '{}'", roleStr);
        switch (roleStr.trim().toUpperCase()) {
          case "ROLE_ADMIN" -> roles.add(findRole(ERole.ROLE_ADMIN));
          case "ROLE_TEACHER" -> roles.add(findRole(ERole.ROLE_TEACHER));
          case "ROLE_STUDENT" -> roles.add(findRole(ERole.ROLE_STUDENT));
          default -> {
            logger.warn("Attempt to register with unrecognized role: {}", roleStr);
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Error: Invalid role '" + roleStr + "'.");
          }
        }
      }
    }
    return roles;
  }

  /**
   * Auxiliary method to find a {@link Role} entity by its {@link ERole}
   * enumeration.
   *
   * @param role The {@link ERole} enumeration of the role to find (e.g.,
   *             ERole.ROLE_ADMIN).
   * @return The corresponding {@link Role} entity.
   * @throws RuntimeException If the role is not found in the database. This
   *                          suggests a problem with the initialization of roles
   *                          in
   *                          {@link AuthServiceApplication}.
   */
  private Role findRole(ERole role) {
    return roleRepository.findByName(role)
        .orElseThrow(() -> new RoleNotFoundException("Role '" + role
            + "' not found in the database. Please ensure default roles are initialized."));
  }

  @Operation(summary = "Get available roles", description = "Returns a list of all available user role names in the system (ADMIN, TEACHER, STUDENT).")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "List of roles obtained successfully.", content = @Content(schema = @Schema(type = "array", implementation = String.class)))
  })
  @GetMapping("/roles")
  public ResponseEntity<?> getAvailableRoles() {
    List<String> roles = Arrays.stream(ERole.values())
        .map(Enum::name)
        .toList();
    return ResponseEntity.ok(roles);
  }

  /**
   * NEW ENDPOINT: Endpoint to renew an access token (JWT) using a valid refresh
   * token.
   *
   * Receives a Refresh Token from the client, validates it, and if it is valid
   * and has not expired,
   * generates a new Access Token and returns it.
   *
   * @param request A {@link TokenRefreshRequest} object containing the refresh
   *                token.
   * @return {@link ResponseEntity} with a {@link TokenRefreshResponse} containing
   *         the new access token
   *         and the original refresh token, if the renewal was successful.
   * @throws TokenRefreshException If the refresh token is not valid or has
   *                               expired.
   */
  @Operation(summary = "Renew access token", description = "Uses a valid Refresh Token to get a new Access Token JWT. The original Refresh Token is kept.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Access token renewed successfully.", content = @Content(schema = @Schema(implementation = TokenRefreshResponse.class))),
      @ApiResponse(responseCode = "404", description = "Refresh Token not found or already invalidated.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "400", description = "Malformed refresh token request (e.g., empty token).", content = @Content(schema = @Schema(implementation = Map.class))) // MethodArgumentNotValidException
  })
  @PostMapping("/refresh-token") // Maps POST requests to /api/auth/refresh-token
  public ResponseEntity<?> refreshToken(@Valid @RequestBody TokenRefreshRequest request) { // Added @Valid to
                                                                                           // activate DTO validation
    String requestRefreshToken = request.getRefreshToken(); // Get the refresh token value from the request.

    // Start a chain of Optional operations to handle the token renewal flow.
    return refreshTokenService.findByToken(requestRefreshToken) // 1. Search for the refresh token in the database.
                                                                // Returns Optional<RefreshToken>.
        .map(refreshTokenService::verifyExpiration) // 2. If found, check if it has expired.
                                                    // If it has expired, delete it from the DB and throw
                                                    // TokenRefreshException.
                                                    // If not, return the same RefreshToken.
        .map(RefreshToken::getUser) // 3. If the token is valid, get the User object associated with the
                                    // RefreshToken.
                                    // (This assumes RefreshToken.getUser() returns a User, not an Optional)
        .map(user -> { // 4. If User is obtained, proceed to generate a new Access Token.
          // Generate a new access token (JWT) using the username of the
          // user associated with the refresh token.
          // It is crucial that your JwtTokenProvider has a method to do this.
          String newAccessToken = jwtTokenProvider.generateTokenFromUsername(user.getUsername());

          // Return an HTTP 200 OK response with the new Access Token
          // and the original Refresh Token.
          return ResponseEntity.ok(new TokenRefreshResponse(newAccessToken, requestRefreshToken, "Bearer"));
        })
        // 5. If at any point in the chain the Optional is empty (token not found)
        // or if TokenRefreshException was thrown (token expired), this block is
        // executed.
        .orElseThrow(() -> new TokenRefreshException(requestRefreshToken,
            "Token de refresco no encontrado en la base de datos"));
  }

  /**
   * NEW ENDPOINT: Endpoint to log out a user by invalidating their refresh token.
   *
   * Receives a Logout Request containing the refresh token.
   * This action effectively ends the user's session by removing the refresh token
   * from the system.
   *
   * @param logoutRequest A {@link LogoutRequest} object containing the refresh
   *                      token.
   * @return {@link ResponseEntity} with a success message if logout is
   *         successful.
   * @throws RuntimeException (or a more specific custom exception) if the refresh
   *                          token
   *                          is not found or an error occurs during invalidation.
   */
  @Operation(summary = "Logout user", description = "Invalidates the user's Refresh Token, effectively ending their session.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Session closed successfully.", content = @Content(schema = @Schema(implementation = String.class))), // Retorna
                                                                                                                                                             // String
      @ApiResponse(responseCode = "400", description = "Invalid request (e.g., missing refresh token).", content = @Content(schema = @Schema(implementation = Map.class))), // Para
                                                                                                                                                                            // errores
                                                                                                                                                                            // de
                                                                                                                                                                            // @Valid
      @ApiResponse(responseCode = "500", description = "Error processing logout request.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))) // Para
                                                                                                                                                                       // errores
                                                                                                                                                                       // internos
  })
  @PostMapping("/logout")
  public ResponseEntity<?> logoutUser(@Valid @RequestBody LogoutRequest logoutRequest) {
    String refreshTokenValue = logoutRequest.getRefreshToken();

    try {
      if (!refreshTokenService.existsByToken(refreshTokenValue)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorResponse(
                "El token de refresco no existe o ya fue invalidado.",
                HttpStatus.NOT_FOUND.value(),
                System.currentTimeMillis()));
      }

      refreshTokenService.deleteByToken(refreshTokenValue);
      return ResponseEntity.ok("Sesión cerrada correctamente.");

    } catch (Exception e) {
      logger.error("Error inesperado al cerrar sesión: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          new ErrorResponse(
              "Error interno al cerrar sesión.",
              HttpStatus.INTERNAL_SERVER_ERROR.value(),
              System.currentTimeMillis()));
    }
  }

  /**
   * Endpoint para listar todos los usuarios registrados en el sistema.
   * Requiere que el usuario autenticado tenga el rol 'ADMIN'.
   *
   * @return {@link ResponseEntity} con una lista de {@link UserSummaryDto} si la
   *         operación es exitosa.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/users")
  @Operation(summary = "List all users", description = "Retrieves a list of all registered users in the system. Accessible only by users with the 'ADMIN' role.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "List of users retrieved successfully.", content = @Content(schema = @Schema(type = "array", implementation = UserSummaryDto.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Authentication required.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Forbidden - User does not have ADMIN role.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<List<UserSummaryDto>> listAllUsers() {
    // Asumiendo que userService.findAllUsers() maneja la lógica de negocio
    // y retorna una lista de DTOs o lanza excepciones que un ControllerAdvice
    // manejaría.
    return ResponseEntity.ok(userService.findAllUsers());
  }

  /**
   * Endpoint para obtener el perfil de un usuario específico por su ID.
   * Accesible por usuarios con el rol 'ADMIN' o por el propio usuario (si su ID
   * coincide con el 'principal.id').
   *
   * @param id El ID del usuario cuyo perfil se desea obtener.
   * @return {@link ResponseEntity} con el {@link UserSummaryDto} del usuario si
   *         se encuentra.
   */
  @PreAuthorize("hasRole('ADMIN') or #id == principal.id")
  @GetMapping("/profile/{id}")
  @Operation(summary = "Get user profile by ID", description = "Retrieves a user's full profile by their ID. Accessible by users with the 'ADMIN' role or the user themselves.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User profile retrieved successfully.", content = @Content(schema = @Schema(implementation = UserProfileDto.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Authentication required.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Forbidden - User does not have the required role or is not the owner of the profile.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "User not found.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getUserProfileById(id));
  }

  /**
   * Endpoint para eliminar un usuario por su ID.
   * Requiere que el usuario autenticado tenga el rol 'ADMIN'.
   *
   * @param id El ID del usuario a eliminar.
   * @return {@link ResponseEntity} con un mensaje de éxito si la eliminación es
   *         correcta.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/users/{id}")
  @Operation(summary = "Delete user by ID", description = "Deletes a user account by their ID. Accessible only by users with the 'ADMIN' role.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User deleted successfully.", content = @Content(schema = @Schema(implementation = String.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Authentication required.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Forbidden - User does not have ADMIN role.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "User not found.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    // Asumiendo que userService.deleteUser(id) maneja la lógica de eliminación
    // y lanza una excepción si el usuario no existe o hay un error.
    userService.deleteUser(id);
    return ResponseEntity.ok("Usuario eliminado correctamente.");
  }

  /**
   * Endpoint para reactivar un usuario previamente desactivado.
   * Requiere que el usuario autenticado tenga el rol 'ADMIN'.
   *
   * @param id El ID del usuario a reactivar.
   * @return {@link ResponseEntity} con un mensaje de éxito si la reactivación es
   *         correcta.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/users/reactivate/{id}")
  @Operation(summary = "Reactivar usuario", description = "Reactiva un usuario previamente desactivado, cambiando su estado a 'enabled'. Solo accesible por administradores.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Usuario reactivado correctamente.", content = @Content(schema = @Schema(implementation = String.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado - Autenticación requerida.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Prohibido - El usuario no tiene el rol ADMIN.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Usuario no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "500", description = "Error interno del servidor.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<?> reactivateUser(@PathVariable Long id) {
    try {
      // Verificar si el usuario existe antes de intentar reactivarlo
      // Asumiendo que userService.existsById(id) es un método disponible
      if (!userService.existsById(id)) { // <-- Asumiendo que UserService tiene este método
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            new ErrorResponse(
                "Usuario no encontrado con ID: " + id,
                HttpStatus.NOT_FOUND.value(),
                System.currentTimeMillis()));
      }

      userService.reactivateUser(id);
      return ResponseEntity.ok("Usuario reactivado correctamente.");
    } catch (Exception e) {
      // Captura cualquier otra excepción inesperada durante el proceso de
      // reactivación
      logger.error("Error inesperado al reactivar usuario: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
          new ErrorResponse(
              "Error interno al reactivar usuario.",
              HttpStatus.INTERNAL_SERVER_ERROR.value(),
              System.currentTimeMillis()));
    }
  }

  @PreAuthorize("isAuthenticated()")
  @GetMapping("/me")
  @Operation(summary = "Obtener el perfil del usuario actual", description = "Retorna el perfil del usuario actual autenticado.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Perfil de usuario recibido satisfactoriamente", content = @Content(schema = @Schema(implementation = UserSummaryDto.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado - Autenticacion requerida", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<UserProfileDto> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
    User user = userRepository.findById(userDetails.getId())
        .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));

    return ResponseEntity.ok(userService.getCurrentUserProfile(user));
  }

  @PutMapping("/me")
  @Operation(summary = "Actualizar perfil del usuario autenticado", description = "Permite al usuario autenticado actualizar sus datos personales: nombres, apellidos y correo electrónico.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente", content = @Content(schema = @Schema(implementation = UserSummaryDto.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos o email duplicado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<UserSummaryDto> updateCurrentUser(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @Valid @RequestBody UpdateProfileRequest request) {

    UserSummaryDto updatedUser = userService.updateCurrentUserProfile(userDetails.getUsername(), request);
    return ResponseEntity.ok(updatedUser);
  }

  @PreAuthorize("isAuthenticated()")
  @PutMapping("/change-password")
  @Operation(summary = "Change password", description = "Allows the authenticated user to securely change their password.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Password changed successfully."),
      @ApiResponse(responseCode = "400", description = "Invalid current password or request."),
      @ApiResponse(responseCode = "401", description = "Unauthorized - not authenticated.")
  })
  public ResponseEntity<String> changePassword(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @Valid @RequestBody ChangePasswordRequest request) {

    userService.changePassword(userDetails.getUsername(), request);
    return ResponseEntity.ok("Contraseña actualizada correctamente.");
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/users/{id}")
  @Operation(summary = "Actualizar usuario por ID (ADMIN)", description = "Permite a un ADMIN actualizar el perfil de un usuario por ID.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente."),
      @ApiResponse(responseCode = "400", description = "Solicitud inválida."),
      @ApiResponse(responseCode = "404", description = "Usuario no encontrado."),
      @ApiResponse(responseCode = "403", description = "Acceso denegado.")
  })
  public ResponseEntity<UserProfileDto> updateUserById(
      @PathVariable Long id,
      @Valid @RequestBody AdminUpdateUserRequest request) {

    UserProfileDto updatedUser = userService.updateUserById(id, request);
    return ResponseEntity.ok(updatedUser);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/users/{id}/enabled")
  @Operation(summary = "Set user enabled status", description = "Enable or disable a user account by ID. Accessible only by ADMIN role.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User enabled status updated."),
      @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  public ResponseEntity<String> setUserEnabled(
      @PathVariable Long id,
      @RequestBody boolean enabled) {

    userService.setUserEnabled(id, enabled);
    return ResponseEntity.ok("Estado de usuario actualizado correctamente.");
  }

  @PreAuthorize("hasRole('ADMIN')")
  @Operation(summary = "Obtener estadísticas de usuarios", description = "Devuelve el total de usuarios, cuántos están activos/inactivos y el conteo por cada rol.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas correctamente"),
      @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Prohibido – requiere rol ADMIN", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @GetMapping("/users/stats")
  public ResponseEntity<UserStatsDto> getUserStats() {
    UserStatsDto stats = userService.getUserStats();
    return ResponseEntity.ok(stats);
  }
}
