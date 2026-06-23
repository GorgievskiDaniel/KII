package com.gorgievskidaniel.kii.controllers;

import com.gorgievskidaniel.kii.entity.Task;
import com.gorgievskidaniel.kii.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository repo;

    @GetMapping
    public Page<Task> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        return repo.search(status, q, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> get(@PathVariable Long id) {
        Optional<Task> t = repo.findById(id);
        return t.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> create(@RequestBody Task task) {
        if (task.getCreatedAt() == null) task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(repo.save(task));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Task> patch(@PathVariable Long id, @RequestBody Task patch) {
        Optional<Task> o = repo.findById(id);
        if (!o.isPresent()) return ResponseEntity.notFound().build();
        Task t = o.get();
        if (patch.getTitle() != null) t.setTitle(patch.getTitle());
        if (patch.getDescription() != null) t.setDescription(patch.getDescription());
        if (patch.getStatus() != null) t.setStatus(patch.getStatus());
        if (patch.getDueDate() != null) t.setDueDate(patch.getDueDate());
        t.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(repo.save(t));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
