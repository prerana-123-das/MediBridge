package com.medibridge.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MediBridgeBackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(MediBridgeBackendApplication.class, args);

        System.out.println("MediBridge Backend Application Started Successfully!");
    }

}