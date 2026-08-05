package com.inkplan.controller;

import com.inkplan.domain.Goal;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.GoalRepository;
import com.inkplan.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** 创建 / 查看学习目标。 */
@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalRepository goals;

    @GetMapping
    public List<Dtos.GoalDto> list() {
        return goals.findByUserIdOrderByCreatedAtDesc(CurrentUser.id()).stream().map(this::toDto).toList();
    }

    @PostMapping
    public Dtos.GoalDto create(@RequestBody Dtos.GoalReq req) {
        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        }
        Goal g = new Goal();
        g.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        g.setUserId(CurrentUser.id());
        g.setTitle(req.title().trim());
        g.setDescription(req.description());
        g.setDailyMinutes(req.dailyMinutes() == null ? 90 : req.dailyMinutes());
        g.setWeeks(req.weeks() == null ? 12 : req.weeks());
        g.setLevel(req.level() == null ? "intermediate" : req.level());
        g.setStatus("active");
        g.setCreatedAt(LocalDateTime.now());
        return toDto(goals.save(g));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        Long uid = CurrentUser.id();
        goals.findById(id).filter(g -> uid.equals(g.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
                .let();
    }

    private Dtos.GoalDto toDto(Goal g) {
        return new Dtos.GoalDto(g.getId(), g.getTitle(), g.getDescription(),
                g.getDailyMinutes() == null ? 0 : g.getDailyMinutes(),
                g.getWeeks() == null ? 0 : g.getWeeks(), g.getLevel(), g.getStatus(),
                g.getCreatedAt() == null ? null : g.getCreatedAt().toString());
    }
}
