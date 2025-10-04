// progress-service: src/main/java/com/tesis/progress_service/client/impl/ClassroomClientImpl.java
package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.ClassroomClient;
import com.tesis.progress_service.security.S2SJwtSigner;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Component
@RequiredArgsConstructor
public class ClassroomClientImpl implements ClassroomClient {

    private final @Qualifier("classroomWebClient") WebClient classroomWebClient;
    private final S2SJwtSigner s2s;

    @Override
    public List<UUID> listMemberIds(UUID classroomId) {
        String token = s2s.buildInternalToken();

        UUID[] ids = classroomWebClient.get()
                .uri("/internal/classrooms/{id}/students/ids", classroomId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(UUID[].class)
                .block();

        return (ids == null) ? List.of() : Arrays.asList(ids);
    }
}
