package com.karte.docs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DocsApplication {

	public static void main(String[] args) {
		SpringApplication.run(DocsApplication.class, args);
	}

}
