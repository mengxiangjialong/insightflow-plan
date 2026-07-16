package com.inkplan.controller;

import com.inkplan.domain.TaskEntity;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.TaskRepository;
import com.inkplan.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository tasks;

    @GetMapping("/today")
    public List<Dtos.TaskDto> today() {
        return tasks.findByUserIdAndTaskDate(CurrentUser.id(), LocalDate.now()).stream()
                .map(t -> new Dtos.TaskDto(t.getId(), t.getTitle(), t.getDetail(),
                        t.getMinutes(), t.getCategory(), Boolean.TRUE.equals(t.getDone())))
                .toList();
    }

    @PostMapping("/{id}/toggle")
    public Dtos.TaskDto toggle(@PathVariable String id) {
        TaskEntity t = tasks.findById(id).orElseThrow();
        t.setDone(!Boolean.TRUE.equals(t.getDone()));
        tasks.save(t);
        return new Dtos.TaskDto(t.getId(), t.getTitle(), t.getDetail(),
                t.getMinutes(), t.getCategory(), t.getDone());
    }
}
