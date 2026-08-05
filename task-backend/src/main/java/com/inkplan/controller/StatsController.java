package com.inkplan.controller;

import com.inkplan.dto.Dtos;
import com.inkplan.security.CurrentUser;
import com.inkplan.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/** 学习统计：今日学习、学习日历、成长曲线、日详情。 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StudyService study;

    @GetMapping("/today")
    public Dtos.TodayStats today() { return study.today(CurrentUser.id()); }

    @GetMapping("/summary")
    public Dtos.StatsSummary summary(@RequestParam(defaultValue = "20") int weeks) {
        return study.summary(CurrentUser.id(), clamp(weeks, 1, 53));
    }

    @GetMapping("/heatmap")
    public List<Dtos.HeatDay> heatmap(@RequestParam(defaultValue = "20") int weeks) {
        return study.heatmap(CurrentUser.id(), clamp(weeks, 1, 53));
    }

    @GetMapping("/growth")
    public List<Dtos.GrowthPoint> growth(@RequestParam(defaultValue = "12") int weeks) {
        return study.growth(CurrentUser.id(), clamp(weeks, 1, 53));
    }

    @GetMapping("/day/{date}")
    public Dtos.DayDetail day(@PathVariable String date) {
        return study.day(CurrentUser.id(), LocalDate.parse(date));
    }

    private static int clamp(int v, int lo, int hi) { return Math.max(lo, Math.min(hi, v)); }
}
