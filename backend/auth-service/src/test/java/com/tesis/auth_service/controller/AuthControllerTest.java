// package com.tesis.auth_service.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.tesis.auth_service.AuthServiceApplication;
// import com.tesis.auth_service.dto.JwtResponse;
// import com.tesis.auth_service.dto.LoginRequest;
// import com.tesis.auth_service.dto.RegisterRequest;
// import com.tesis.auth_service.dto.TokenRefreshRequest;
// import com.tesis.auth_service.dto.TokenRefreshResponse;
// import com.tesis.auth_service.model.ERole;
// import com.tesis.auth_service.model.Role;
// import com.tesis.auth_service.model.User;
// import com.tesis.auth_service.repository.RefreshTokenRepository;
// import com.tesis.auth_service.repository.RoleRepository;
// import com.tesis.auth_service.repository.UserRepository;
// import com.tesis.auth_service.service.ProfileClient;
// import com.tesis.auth_service.dto.ProfileCreationRequest;
// import com.tesis.auth_service.service.RefreshTokenService;
// import org.junit.jupiter.api.AfterEach;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.mock.mockito.MockBean;
// import org.springframework.http.MediaType;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.test.context.ActiveProfiles;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.MvcResult;

// import java.util.Collections;
// import java.util.Set;
// import java.util.stream.Collectors;

// import static org.assertj.core.api.Assertions.assertThat;
// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertTrue;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyString;
// import static org.mockito.Mockito.doNothing;
// import static org.mockito.Mockito.verify;
// import static org.mockito.Mockito.times;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @SpringBootTest(classes = AuthServiceApplication.class)
// @AutoConfigureMockMvc
// @ActiveProfiles("test")
// class AuthControllerTest {

//         @Autowired
//         private MockMvc mockMvc;

//         @Autowired
//         private ObjectMapper objectMapper;

//         @Autowired
//         private UserRepository userRepository;

//         @Autowired
//         private RoleRepository roleRepository;

//         @Autowired
//         private PasswordEncoder passwordEncoder;

//         @Autowired
//         private RefreshTokenService refreshTokenService;

//         @Autowired
//         private RefreshTokenRepository refreshTokenRepository;

//         @MockBean
//         private ProfileClient profileClient;

//         @BeforeEach
//         void setUp() {
//                 createRoleIfNotFound(ERole.ROLE_STUDENT);
//                 createRoleIfNotFound(ERole.ROLE_TEACHER);
//                 createRoleIfNotFound(ERole.ROLE_ADMIN);

//                 refreshTokenRepository.deleteAll();
//                 userRepository.deleteAll();

//                 doNothing().when(profileClient).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @AfterEach
//         void tearDown() {
//                 refreshTokenRepository.deleteAll();
//                 userRepository.deleteAll();
//         }

//         // region Auxiliary Methods

//         private void createRoleIfNotFound(ERole roleName) {
//                 roleRepository.findByName(roleName)
//                                 .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
//         }

//         private void guardarUsuarioDePrueba(String username, String password, boolean enabled, Set<ERole> roles) {
//                 Set<Role> userRoles = roles.stream()
//                                 .map(role -> roleRepository.findByName(role).orElseThrow())
//                                 .collect(Collectors.toSet());

//                 userRepository.save(User.builder()
//                                 .username(username)
//                                 .password(passwordEncoder.encode(password))
//                                 .enabled(enabled)
//                                 .accountNonLocked(true)
//                                 .credentialsNonExpired(true)
//                                 .roles(userRoles)
//                                 .build());
//         }

//         // endregion

//         // region Tests: /api/auth/register

//         @Test
//         @DisplayName("Register user with default role (STUDENT)")
//         void registrarUsuarioConRolPorDefecto() throws Exception {
//                 RegisterRequest request = new RegisterRequest("newuser", "password123", "newuser@example.com",
//                                 "Test Nombres", "Test Apellidos",
//                                 Collections.emptySet());

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isCreated())
//                                 .andExpect(content().string(
//                                                 "User registered and profile creation request sent successfully."));

//                 assertTrue(userRepository.findByUsername("newuser").isPresent());
//                 assertTrue(userRepository.findByUsername("newuser").get().getRoles().stream()
//                                 .anyMatch(r -> r.getName() == ERole.ROLE_STUDENT));

//                 verify(profileClient, times(1)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Register user with TEACHER role")
//         void registrarUsuarioConRolTeacher() throws Exception {
//                 Set<String> roles = Set.of("ROLE_TEACHER");
//                 RegisterRequest request = new RegisterRequest("teacheruser", "password456", "teacher@example.com",
//                                 "Teacher Nombres", "Teacher Apellidos", roles);

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isCreated())
//                                 .andExpect(content().string(
//                                                 "User registered and profile creation request sent successfully."));

//                 var usuario = userRepository.findByUsername("teacheruser").orElseThrow();
//                 assertTrue(usuario.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_TEACHER));

//                 verify(profileClient, times(1)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error registering user with existing username")
//         void errorRegistroPorUsernameExistente() throws Exception {
//                 guardarUsuarioDePrueba("existinguser", "password", true, Set.of(ERole.ROLE_STUDENT));

//                 RegisterRequest request = new RegisterRequest("existinguser", "newpass", "existing@example.com",
//                                 "Existing Nombres", "Existing Apellidos", Collections.emptySet());

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isConflict())
//                                 .andExpect(jsonPath("$.message").value("Username is already in use."));

//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error registering user with existing email")
//         void errorRegistroPorEmailExistente() throws Exception {
//                 guardarUsuarioDePrueba("userforemailcheck", "password", true, Set.of(ERole.ROLE_STUDENT));
//                 User existingUser = userRepository.findByUsername("userforemailcheck").orElseThrow();
//                 existingUser.setEmail("existing@example.com");
//                 userRepository.save(existingUser);

//                 RegisterRequest request = new RegisterRequest("anotheruser", "newpass", "existing@example.com",
//                                 "Another Nombres", "Another Apellidos", Collections.emptySet());

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isConflict())
//                                 .andExpect(jsonPath("$.message").value("Email is already in use."));

//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error registering user with invalid role")
//         void errorRegistroPorRolInvalido() throws Exception {
//                 RegisterRequest request = new RegisterRequest("invalidroleuser", "password123",
//                                 "invalidrole@example.com",
//                                 "Invalid Nombres", "Invalid Apellidos",
//                                 Set.of("INVALID_ROLE"));

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isBadRequest())
//                                 .andExpect(jsonPath("$.message").value("Error: Invalid role 'INVALID_ROLE'."));

//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Register user with multiple valid roles")
//         void registrarUsuarioConMultiplesRoles() throws Exception {
//                 RegisterRequest request = new RegisterRequest("multiroleuser", "password789", "multirole@example.com",
//                                 "Multi Nombres", "Multi Apellidos",
//                                 Set.of("ROLE_TEACHER", "ROLE_ADMIN"));

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isCreated())
//                                 .andExpect(content().string(
//                                                 "User registered and profile creation request sent successfully."));

//                 var user = userRepository.findByUsername("multiroleuser").orElseThrow();
//                 var userRoles = user.getRoles();

//                 assertEquals(2, userRoles.size());
//                 assertTrue(userRoles.stream().anyMatch(r -> r.getName() == ERole.ROLE_TEACHER));
//                 assertTrue(userRoles.stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN));

//                 verify(profileClient, times(1)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error registering user without username")
//         void errorRegistroPorUsernameVacio() throws Exception {
//                 RegisterRequest request = new RegisterRequest("", "password", "emptyuser@example.com",
//                                 "Empty Nombres", "Empty Apellidos", Collections.emptySet());

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isBadRequest());
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error registering user with too short password")
//         void errorRegistroPorPasswordCorta() throws Exception {
//                 RegisterRequest request = new RegisterRequest("shortpass", "123", "shortpass@example.com",
//                                 "Shortpass Nombres", "Shortpass Apellidos",
//                                 Collections.emptySet());

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isBadRequest());
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error registering user with too short username")
//         void errorRegistroPorUsernameCorto() throws Exception {
//                 RegisterRequest request = new RegisterRequest("ab", "password123", "shortuser@example.com",
//                                 "Shortuser Nombres", "Shortuser Apellidos",
//                                 Collections.emptySet());

//                 mockMvc.perform(post("/api/auth/register")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isBadRequest());
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         // endregion

//         // region Tests: /api/auth/login

//         @Test
//         @DisplayName("Successful login and return of JWT and Refresh Token")
//         void loginExitosoRetornaJwtYRefreshToken() throws Exception {
//                 guardarUsuarioDePrueba("validuser", "securepass", true, Set.of(ERole.ROLE_STUDENT));
//                 LoginRequest request = new LoginRequest("validuser", "securepass");

//                 MvcResult result = mockMvc.perform(post("/api/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isOk())
//                                 .andExpect(jsonPath("$.token").exists())
//                                 .andExpect(jsonPath("$.refreshToken").exists())
//                                 .andExpect(jsonPath("$.id").exists())
//                                 .andExpect(jsonPath("$.username").value("validuser"))
//                                 .andExpect(jsonPath("$.roles[0]").value("ROLE_STUDENT"))
//                                 .andReturn();

//                 JwtResponse jwtResponse = objectMapper.readValue(result.getResponse().getContentAsString(),
//                                 JwtResponse.class);
//                 assertThat(jwtResponse.getToken()).isNotEmpty();
//                 assertThat(jwtResponse.getRefreshToken()).isNotEmpty();

//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Login error with incorrect credentials")
//         void errorLoginPorCredencialesIncorrectas() throws Exception {
//                 LoginRequest request = new LoginRequest("nonexistent", "wrongpass");

//                 mockMvc.perform(post("/api/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isUnauthorized());
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Login error if account is disabled")
//         void errorLoginPorCuentaDeshabilitada() throws Exception {
//                 guardarUsuarioDePrueba("disableduser", "pass123", false, Set.of(ERole.ROLE_STUDENT));
//                 LoginRequest request = new LoginRequest("disableduser", "pass123");

//                 mockMvc.perform(post("/api/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(request)))
//                                 .andExpect(status().isUnauthorized());
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         // endregion

//         // region Tests: /api/auth/roles

//         @Test
//         @DisplayName("Return list of available roles")
//         void devolverListaDeRoles() throws Exception {
//                 mockMvc.perform(get("/api/auth/roles")
//                                 .contentType(MediaType.APPLICATION_JSON))
//                                 .andExpect(status().isOk())
//                                 .andExpect(jsonPath("$[0]").value("ROLE_ADMIN"))
//                                 .andExpect(jsonPath("$[1]").value("ROLE_TEACHER"))
//                                 .andExpect(jsonPath("$[2]").value("ROLE_STUDENT"));
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         // endregion

//         // region Tests: /api/auth/refresh-token (New tests!)

//         @Test
//         @DisplayName("Refresh access token successfully")
//         void refrescarTokenExitosamente() throws Exception {
//                 String username = "refreshuser";
//                 String password = "refreshpass";
//                 guardarUsuarioDePrueba(username, password, true, Set.of(ERole.ROLE_STUDENT));

//                 LoginRequest loginRequest = new LoginRequest(username, password);
//                 MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(loginRequest)))
//                                 .andExpect(status().isOk())
//                                 .andReturn();

//                 JwtResponse jwtResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
//                                 JwtResponse.class);
//                 String originalAccessToken = jwtResponse.getToken();
//                 String originalRefreshToken = jwtResponse.getRefreshToken();

//                 assertThat(originalAccessToken).isNotNull().isNotEmpty();
//                 assertThat(originalRefreshToken).isNotNull().isNotEmpty();

//                 TokenRefreshRequest refreshRequest = new TokenRefreshRequest();
//                 refreshRequest.setRefreshToken(originalRefreshToken);

//                 MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh-token")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(refreshRequest)))
//                                 .andExpect(status().isOk())
//                                 .andReturn();

//                 TokenRefreshResponse refreshResponse = objectMapper.readValue(
//                                 refreshResult.getResponse().getContentAsString(),
//                                 TokenRefreshResponse.class);

//                 assertThat(refreshResponse.getAccessToken()).isNotNull().isNotEmpty();
//                 assertThat(refreshResponse.getRefreshToken()).isEqualTo(originalRefreshToken);
//                 assertThat(refreshResponse.getAccessToken()).isNotEqualTo(originalAccessToken);
//                 assertThat(refreshResponse.getTokenType()).isEqualToIgnoringCase("Bearer");

//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error refreshing token with non-existent Refresh Token")
//         void errorRefrescarConTokenNoExistente() throws Exception {
//                 TokenRefreshRequest refreshRequest = new TokenRefreshRequest();
//                 String nonexistentToken = "unexistent_refresh_token";
//                 refreshRequest.setRefreshToken(nonexistentToken);

//                 mockMvc.perform(post("/api/auth/refresh-token")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(refreshRequest)))
//                                 .andExpect(status().isNotFound())
//                                 // ✅ MODIFICACIÓN CLAVE: Cambiar la aserción a la versión en español
//                                 .andExpect(jsonPath("$.message").value(String.format(
//                                                 "Refresh token [%s] no es válido: Token de refresco no encontrado en la base de datos",
//                                                 nonexistentToken)));
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         @Test
//         @DisplayName("Error refreshing token with expired Refresh Token (simulated)")
//         void errorRefrescarConTokenExpirado() throws Exception {
//                 String username = "expiredrefreshuser";
//                 String password = "expiredpass";
//                 guardarUsuarioDePrueba(username, password, true, Set.of(ERole.ROLE_STUDENT));

//                 LoginRequest loginRequest = new LoginRequest(username, password);
//                 MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(loginRequest)))
//                                 .andExpect(status().isOk())
//                                 .andReturn();

//                 JwtResponse jwtResponse = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
//                                 JwtResponse.class);
//                 String expiredRefreshToken = jwtResponse.getRefreshToken();

//                 refreshTokenService.deleteByToken(expiredRefreshToken);

//                 TokenRefreshRequest refreshRequest = new TokenRefreshRequest();
//                 refreshRequest.setRefreshToken(expiredRefreshToken);

//                 mockMvc.perform(post("/api/auth/refresh-token")
//                                 .contentType(MediaType.APPLICATION_JSON)
//                                 .content(objectMapper.writeValueAsString(refreshRequest)))
//                                 .andExpect(status().isNotFound())
//                                 // ✅ MODIFICACIÓN CLAVE: Cambiar la aserción a la versión en español
//                                 .andExpect(jsonPath("$.message").value(String.format(
//                                                 "Refresh token [%s] no es válido: Token de refresco no encontrado en la base de datos",
//                                                 expiredRefreshToken)));
//                 verify(profileClient, times(0)).createUserProfile(any(ProfileCreationRequest.class), anyString());
//         }

//         // endregion
// }
