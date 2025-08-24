package com.tesis.assessment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableCaching
@SpringBootApplication
@EnableDiscoveryClient
public class AssessmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AssessmentServiceApplication.class, args);
	}

}
