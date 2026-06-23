package com.gorgievskidaniel.kii.controllers;

import com.gorgievskidaniel.kii.entity.Greeting;
import com.gorgievskidaniel.kii.repository.GreetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @Autowired
    private GreetingRepository repository;

    @GetMapping("/api")
    public Greeting showHome() {
        return repository.findById(1).orElse(new Greeting("Kii Project"));
    }

}
