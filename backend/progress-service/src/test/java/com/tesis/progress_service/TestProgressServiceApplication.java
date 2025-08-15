package com.tesis.progress_service;

import org.springframework.boot.SpringApplication;

public class TestProgressServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(ProgressServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
