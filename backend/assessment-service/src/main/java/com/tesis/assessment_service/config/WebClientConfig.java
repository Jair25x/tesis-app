package com.tesis.assessment_service.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
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
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

  @Value("${clients.classroom.base-url}")
  private String classroomBaseUrl;
  @Value("${clients.curriculum.base-url}")
  private String curriculumBaseUrl;
  @Value("${clients.progress.base-url}")
  private String progressBaseUrl;

  // S2S classroom
  @Value("${clients.classroom.s2s.user-id:00000000-0000-0000-0000-000000000000}")
  private String classroomS2SUserId;
  @Value("${clients.classroom.s2s.roles:INTERNAL}")
  private String classroomS2SRoles;

  // S2S curriculum
  @Value("${clients.curriculum.s2s.user-id:00000000-0000-0000-0000-000000000000}")
  private String curriculumS2SUserId;
  @Value("${clients.curriculum.s2s.roles:INTERNAL}")
  private String curriculumS2SRoles;

  // S2S progress
  @Value("${clients.progress.s2s.user-id:00000000-0000-0000-0000-000000000000}")
  private String progressS2SUserId;
  @Value("${clients.progress.s2s.roles:INTERNAL}")
  private String progressS2SRoles;

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

  /**
   * Útil para servicios externos (advisor) o cuando sí quieres pasar el JWT del
   * usuario.
   */
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

  /**
   * Mapea 4xx/5xx a ResponseStatusException (no usar cuando quieras inspeccionar
   * status “tal cual”).
   */
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

  // ---- S2S headers helpers

  private ExchangeFilterFunction s2sHeaders(String userId, String rolesCsv) {
    return (request, next) -> {
      ClientRequest.Builder rb = ClientRequest.from(request)
          .header("X-Internal-Call", "true")
          .header("X-Auth-Roles", normalizeRolesCsv(rolesCsv))
          .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
      if (StringUtils.hasText(userId)) {
        rb.header("x-user-id", userId);
        rb.header("X-Auth-Username", userId);
      }
      return next.exchange(rb.build());
    };
  }

  private String normalizeRolesCsv(String csv) {
    if (!StringUtils.hasText(csv))
      return "INTERNAL";
    String[] parts = csv.split(",");
    StringBuilder out = new StringBuilder();
    for (String p : parts) {
      String t = p.trim();
      if (!t.isEmpty()) {
        if (out.length() > 0)
          out.append(',');
        out.append(t);
      }
    }
    return out.length() == 0 ? "INTERNAL" : out.toString();
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
        .filter(s2sHeaders(classroomS2SUserId, classroomS2SRoles)) // S2S
        .build();
  }

  @Bean
  @Qualifier("curriculumWebClient")
  public WebClient curriculumWebClient() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(curriculumBaseUrl)
        .filter(s2sHeaders(curriculumS2SUserId, curriculumS2SRoles)) // S2S
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
        .filter(s2sHeaders(progressS2SUserId, progressS2SRoles)) // S2S
        .filter(mapErrors())
        .build();
  }

  @Bean
  @Qualifier("advisorWebClient")
  public WebClient advisorWebClient(@Value("${clients.advisor.base-url}") String baseUrl) {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(baseUrl)
        .filter(forwardAuth()) // si advisor valida el JWT del usuario final
        .filter(mapErrors())
        .build();
  }
}
