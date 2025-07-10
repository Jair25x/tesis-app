package com.tesis.Admin_monitoring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import de.codecentric.boot.admin.server.config.EnableAdminServer;

@EnableAdminServer
@SpringBootApplication
public class AdminMonitoringApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdminMonitoringApplication.class, args);
	}

}
