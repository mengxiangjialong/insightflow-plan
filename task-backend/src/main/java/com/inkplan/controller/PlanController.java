package com.inkplan.controller;

import com.inkplan.domain.Phase;
import com.inkplan.domain.Plan;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.PhaseRepository;
import com.inkplan.repository.PhaseTaskRepository;
import com.inkplan.repository.PlanRepository;
import com.inkplan.security.CurrentUser;
import com.inkplan.service.AiPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 计划接口。所有读写均以 JWT 中的 userId 为过滤条件，
 * 保证用户之间的数据完全隔离（越权访问返回 404）。
 */
@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final AiPlanService ai;
    private final PlanRepository plans;
    private final PhaseRepository phases;
    private final PhaseTaskRepository phaseTasks;

    @GetMapping
    public List<Dtos.PlanDto> list() {
        Long uid = CurrentUser.id();
        return plans.findByUserIdOrderByCreatedAtDesc(uid).stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public Dtos.PlanDto get(@PathVariable String id) {
        Long uid = CurrentUser.id();
        Plan plan = plans.findById(id)
                .filter(p -> uid.equals(p.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan not found"));
        return toDto(plan);
    }

    @PostMapping("/generate")
    public Dtos.PlanDto generate(@RequestBody Dtos.GeneratePlanReq req) {
        Dtos.PlanDto generated = ai.generate(req);
        Plan plan = new Plan();
        plan.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        plan.setUserId(CurrentUser.id());
        plan.setTitle(generated.title());
        plan.setGoal(generated.goal());
        plan.setDailyMinutes(generated.dailyMinutes());
        plan.setWeeks(generated.weeks());
        plan.setLevel(generated.level());
        plan.setProgress(0.0);
        plan.setCreatedAt(LocalDateTime.now());
        plans.save(plan);
        return toDto(plan);
    }

    private Dtos.PlanDto toDto(Plan p) {
        List<Dtos.PhaseDto> phaseDtos = phases.findByPlanIdOrderByIndexAsc(p.getId()).stream()
                .map(this::toPhaseDto)
                .toList();
        return new Dtos.PlanDto(p.getId(), p.getTitle(), p.getGoal(),
                p.getDailyMinutes() == null ? 0 : p.getDailyMinutes(),
                p.getWeeks() == null ? 0 : p.getWeeks(),
                p.getLevel(),
                p.getCreatedAt() == null ? null : p.getCreatedAt().toString(),
                p.getProgress() == null ? 0.0 : p.getProgress(),
                phaseDtos);
    }

    private Dtos.PhaseDto toPhaseDto(Phase ph) {
        List<Dtos.PhaseTaskDto> tasks = phaseTasks.findByPhaseId(ph.getId()).stream()
                .map(t -> new Dtos.PhaseTaskDto(t.getId(), t.getTitle(), Boolean.TRUE.equals(t.getDone())))
                .toList();
        return new Dtos.PhaseDto(ph.getId(), ph.getIndex() == null ? 0 : ph.getIndex(), ph.getTitle(), ph.getSummary(),
                ph.getProgress() == null ? 0.0 : ph.getProgress(), ph.getStatus(), tasks);
    }
}
