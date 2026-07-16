package com.inkplan.service;

import com.inkplan.dto.Dtos;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * AI 生成学习计划。示例实现为占位，
 * 生产环境替换为调用 DeepSeek / OpenAI / 通义千问 等 LLM。
 * 使用 Redis 缓存相同入参的生成结果（@Cacheable）。
 */
@Service
public class AiPlanService {

    @Cacheable(value = "inkplan:ai:plan", key = "#req.goal() + ':' + #req.weeks() + ':' + #req.level()")
    public Dtos.PlanDto generate(Dtos.GeneratePlanReq req) {
        String id = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        List<Dtos.PhaseDto> phases = List.of(
            new Dtos.PhaseDto("ph1", 1, "基础夯实", "词汇扩展与语法结构精讲", 0.0, "active",
                List.of(new Dtos.PhaseTaskDto("ph1t1", "核心词汇 3000 首轮背诵", false))),
            new Dtos.PhaseDto("ph2", 2, "专项突破", "听力与阅读技巧训练", 0.0, "locked", List.of()),
            new Dtos.PhaseDto("ph3", 3, "冲刺模考", "全真模拟与错题精讲", 0.0, "locked", List.of())
        );
        return new Dtos.PlanDto(id, req.goal(), req.goal(), req.dailyMinutes(), req.weeks(),
                req.level(), LocalDateTime.now().toString(), 0.0, phases);
    }
}
