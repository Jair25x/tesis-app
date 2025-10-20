package com.tesis.assessment_service.config;

import com.tesis.assessment_service.security.S2SJwtSigner;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.*;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Arrays;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

  private final S2SJwtSigner s2sJwtSigner;

  @Value("${clients.classroom.base-url}")
  private String classroomBaseUrl;
  @Value("${clients.curriculum.base-url}")
  private String curriculumBaseUrl;
  @Value("${clients.progress.base-url}")
  private String progressBaseUrl;

  // S2S classroom
  @Value("${clients.classroom.s2s.user-id:assessment-service}")
  private String classroomS2SUserId;
  @Value("${clients.classroom.s2s.roles:ROLE_INTERNAL}")
  private String classroomS2SRoles;

  // S2S curriculum
  @Value("${clients.curriculum.s2s.user-id:assessment-service}")
  private String curriculumS2SUserId;
  @Value("${clients.curriculum.s2s.roles:ROLE_INTERNAL}")
  private String curriculumS2SRoles;

  // S2S progress
  @Value("${clients.progress.s2s.user-id:assessment-service}")
  private String progressS2SUserId;
  @Value("${clients.progress.s2s.roles:ROLE_INTERNAL}")
  private String progressS2SRoles;

  // Externo (advisor): suele requerir propagar JWT del usuario
  @Value("${clients.advisor.base-url}")
  private String advisorBaseUrl;

  @Value("${assessment.http.timeout-ms:2000}")
  private int timeoutMs;

  private ReactorClientHttpConnector connector() {
    HttpClient httpClient = HttpClient.create()
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, timeoutMs)
        .responseTimeout(Duration.ofMillis(timeoutMs))
        .doOnConnected(conn -> conn
            .addHandlerLast(new ReadTimeoutHandler(timeoutMs, TimeUnit.MILLISECONDS))
            .addHandlerLast(new WriteTimeoutHandler(timeoutMs, TimeUnit.MILLISECONDS)));
    return new ReactorClientHttpConnector(httpClient);
  }

  private ExchangeStrategies strategies() {
    return ExchangeStrategies.builder()
        .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
        .build();
  }

  private ExchangeFilterFunction mapErrors() {
    return ExchangeFilterFunction.ofResponseProcessor(resp -> {
      if (resp.statusCode().is4xxClientError() || resp.statusCode().is5xxServerError()) {
        return resp.createException().flatMap(ex -> Mono
            .error(new org.springframework.web.server.ResponseStatusException(resp.statusCode(), ex.getMessage(), ex)));
      }
      return Mono.just(resp);
    });
  }

  private void copyIfPresent(jakarta.servlet.http.HttpServletRequest http, ClientRequest.Builder rb, String name) {
    var v = http.getHeader(name);
    if (StringUtils.hasText(v))
      rb.header(name, v);
  }

  /** Propaga Authorization del usuario (para servicios externos como advisor). */
  private ExchangeFilterFunction forwardAuth() {
    return (request, next) -> {
      ClientRequest.Builder rb = ClientRequest.from(request);
      var attrs = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
      if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
        var http = sra.getRequest();
        var auth = http.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(auth))
          rb.header(HttpHeaders.AUTHORIZATION, auth);
        copyIfPresent(http, rb, "X-Internal-Call");
        copyIfPresent(http, rb, "x-user-id");
        copyIfPresent(http, rb, "X-Auth-Username");
        copyIfPresent(http, rb, "X-Auth-Roles");
      }
      return next.exchange(rb.build());
    };
  }

  // ---- S2S helpers (Bearer + headers internos) ----

  private String normalizeRolesCsv(String csv) {
    if (!StringUtils.hasText(csv))
      return "ROLE_INTERNAL";
    return Arrays.stream(csv.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase(Locale.ROOT))
        .collect(Collectors.joining(","));
  }

  /** Adjunta Authorization: Bearer <S2S>, X-Internal-* y Content-Type. */
  private ExchangeFilterFunction s2sAuth(String userId, String rolesCsv) {
    final String normalizedRoles = normalizeRolesCsv(rolesCsv);
    final String xUser = StringUtils.hasText(userId) ? userId : "assessment-service";

    return (request, next) -> {
      String token = s2sJwtSigner.buildToken(); // usa S2S_JWT_SECRET; ttl por defecto
      ClientRequest.Builder rb = ClientRequest.from(request)
          .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
          .header("X-Internal-Call", "assessment-service")
          .header("X-Auth-Username", xUser)
          .header("X-Auth-Roles", normalizedRoles)
          .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
      if (StringUtils.hasText(userId)) {
        rb.header("x-user-id", userId);
      }
      return next.exchange(rb.build());
    };
  }

  // ---------------------
  // WEBCLIENTS
  // ---------------------

  @Bean
  @Qualifier("classroomWebClient")
  public WebClient classroomWebClient() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(classroomBaseUrl)
        .filter(s2sAuth(classroomS2SUserId, classroomS2SRoles))
        .filter(mapErrors())
        .build();
  }

  @Bean
  @Qualifier("curriculumWebClient")
  public WebClient curriculumWebClient() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(curriculumBaseUrl)
        .filter(s2sAuth(curriculumS2SUserId, curriculumS2SRoles))
        .filter(mapErrors())
        .build();
  }

  @Bean
  @Qualifier("progressWebClient")
  public WebClient progressWebClient() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(progressBaseUrl)
        .filter(s2sAuth(progressS2SUserId, progressS2SRoles))
        .filter(mapErrors())
        .build();
  }

  /** Cliente externo (propaga el JWT del usuario). */
  @Bean
  @Qualifier("advisorWebClient")
  public WebClient advisorWebClient() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(advisorBaseUrl)
        .filter(forwardAuth())
        .filter(mapErrors())
        .build();
  }
}
