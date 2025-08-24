package com.tesis.assessment_service.service;

public interface OutboxResendService {
  int resendProgressOnce(int limit);

  int resendAdvisorOnce(int limit);
}
