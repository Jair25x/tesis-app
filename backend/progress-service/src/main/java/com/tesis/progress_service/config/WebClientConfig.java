package com.tesis.progress_service.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

  @Value("${progress.http.timeout-ms:1500}")
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

  /** ✅ Builder “plano” (PRIMARY). Lo usará Spring Boot Admin automáticamente. */
  @Bean
  @Primary
  public WebClient.Builder webClientBuilder() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies());
  }

  /** ✅ Builder con LoadBalancer para llamadas lb:// */
  @Bean
  @LoadBalanced
  @Qualifier("lbWebClientBuilder")
  public WebClient.Builder lbWebClientBuilder() {
    return WebClient.builder()
        .clientConnector(connector())
        .exchangeStrategies(strategies());
  }
}
