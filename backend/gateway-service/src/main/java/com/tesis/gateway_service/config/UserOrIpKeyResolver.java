package com.tesis.gateway_service.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;

@Component
public class UserOrIpKeyResolver implements KeyResolver {
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        // Si JwtGatewayFilter (previo en filters) puso x-user-id, úsalo
        String uid = exchange.getRequest().getHeaders().getFirst("x-user-id");
        if (uid != null && !uid.isBlank()) return Mono.just("u:" + uid);

        ServerHttpRequest req = exchange.getRequest();
        String xff = req.getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // Si viene con múltiples IPs, toma la primera
            String first = xff.split(",")[0].trim();
            if (!first.isBlank()) return Mono.just("ip:" + first);
        }

        InetSocketAddress remote = req.getRemoteAddress();
        String ip = (remote != null && remote.getAddress() != null)
                ? remote.getAddress().getHostAddress()
                : "unknown";
        return Mono.just("ip:" + ip);
    }
}
