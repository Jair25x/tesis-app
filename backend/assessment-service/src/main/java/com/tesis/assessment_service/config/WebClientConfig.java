package com.tesis.assessment_service.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpHeaders;
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

  private ExchangeFilterFunction forwardAuth() {
    return (request, next) -> {
      ClientRequest.Builder rb = ClientRequest.from(request);
      var attrs = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
      if (attrs instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
        var http = sra.getRequest();

        var auth = http.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(auth))
          rb.header(HttpHeaders.AUTHORIZATION, auth);

        var internal = http.getHeader("X-Internal-Call");
        if (StringUtils.hasText(internal))
          rb.header("X-Internal-Call", internal);

        copyIfPresent(http, rb, "x-user-id");
        copyIfPresent(http, rb, "X-Auth-Username");
        copyIfPresent(http, rb, "X-Auth-Roles");
      }
      return next.exchange(rb.build());
    };
  }

  private void copyIfPresent(jakarta.servlet.http.HttpServletRequest http, ClientRequest.Builder rb, String name) {
    var v = http.getHeader(name);
    if (StringUtils.hasText(v))
      rb.header(name, v);
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

  @Bean
  @Qualifier("classroomWebClient")
  public WebClient classroomWebClient() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(classroomBaseUrl)
        .filter(forwardAuth())
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
        .filter(forwardAuth())
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
        .filter(forwardAuth())
        .filter(mapErrors())
        .build();
  }

  @Bean
  @Qualifier("advisorWebClient")
  public WebClient advisorWebClient(
      @Value("${clients.advisor.base-url}") String baseUrl) {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies())
        .baseUrl(baseUrl)
        .filter(forwardAuth()) // opcional; para /internal podrías no necesitar Bearer
        .filter(mapErrors())
        .build();
  }
}
