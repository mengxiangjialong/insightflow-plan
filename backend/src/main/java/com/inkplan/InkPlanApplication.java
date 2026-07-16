package com.inkplan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class InkPlanApplication {
    public static void main(String[] args) {
        SpringApplication.run(InkPlanApplication.class, args);
    }
}