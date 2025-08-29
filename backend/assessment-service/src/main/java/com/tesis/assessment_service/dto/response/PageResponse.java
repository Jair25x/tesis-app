package com.tesis.assessment_service.dto.response;

import java.util.List;

/** Contenedor de paginación consistente. */
public class PageResponse<T> {

  private int page;
  private int size;
  private long totalElements;
  private int totalPages;
  private List<T> content;

  public PageResponse() {
  }

  public PageResponse(int page, int size, long totalElements, int totalPages, List<T> content) {
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
    this.content = content;
  }

  public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
    return new PageResponse<>(
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.getContent());
  }

  /** Nuevo: construir desde lista + metadatos. */
  public static <T> PageResponse<T> of(List<T> content, int page, int size, long totalElements) {
    int totalPages = size <= 0 ? 0 : (int) Math.ceil((double) totalElements / (double) size);
    return new PageResponse<>(page, size, totalElements, totalPages, content);
  }

  // getters/setters
  public int getPage() {
    return page;
  }

  public void setPage(int page) {
    this.page = page;
  }

  public int getSize() {
    return size;
  }

  public void setSize(int size) {
    this.size = size;
  }

  public long getTotalElements() {
    return totalElements;
  }

  public void setTotalElements(long totalElements) {
    this.totalElements = totalElements;
  }

  public int getTotalPages() {
    return totalPages;
  }

  public void setTotalPages(int totalPages) {
    this.totalPages = totalPages;
  }

  public List<T> getContent() {
    return content;
  }

  public void setContent(List<T> content) {
    this.content = content;
  }
}
