package com.inkplan.controller;

import com.inkplan.dto.Dtos;
import com.inkplan.service.AiPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
public class PlanController {

    private final AiPlanService ai;

    @GetMapping
    public List<Dtos.PlanDto> list() {
        // TODO: 装配当前用户的计划列表
        return List.of();
    }

    @GetMapping("/{id}")
    public Dtos.PlanDto get(@PathVariable String id) {
        // TODO: 从数据库查询
        return ai.generate(new Dtos.GeneratePlanReq("学习计划", 60, 12, "intermediate"));
    }

    @PostMapping("/generate")
    public Dtos.PlanDto generate(@RequestBody Dtos.GeneratePlanReq req) {
        return ai.generate(req);
    }
}
