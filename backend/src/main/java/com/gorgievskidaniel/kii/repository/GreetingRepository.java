package com.gorgievskidaniel.kii.repository;

import com.gorgievskidaniel.kii.entity.Greeting;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GreetingRepository extends CrudRepository<Greeting, Integer> {
}
