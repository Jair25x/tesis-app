//src/main/java/com/tesis/classroom_service/client/ProfileCacheService.java
package com.tesis.classroom_service.client;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileCacheService {

  private final ProfileClient profileClient;
  private final CacheManager cacheManager;

  private Cache cache() {
    return cacheManager.getCache("profiles");
  }

  public List<ProfileClient.PublicProfile> getProfiles(List<UUID> ids) {
    if (ids == null || ids.isEmpty())
      return List.of();
    Cache c = cache();
    Map<UUID, ProfileClient.PublicProfile> hit = new HashMap<>();
    List<UUID> miss = new ArrayList<>();
    for (UUID id : ids) {
      ProfileClient.PublicProfile p = c != null ? c.get(id, ProfileClient.PublicProfile.class) : null;
      if (p != null)
        hit.put(id, p);
      else
        miss.add(id);
    }
    if (!miss.isEmpty()) {
      List<ProfileClient.PublicProfile> fetched = profileClient.fetchProfiles(miss);
      if (c != null)
        fetched.forEach(p -> c.put(p.id(), p));
      fetched.forEach(p -> hit.put(p.id(), p));
    }
    // Devuelve en el mismo orden de entrada
    return ids.stream().map(hit::get).filter(Objects::nonNull).collect(Collectors.toList());
  }
}
