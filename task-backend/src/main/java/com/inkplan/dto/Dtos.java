package com.inkplan.dto;

import java.util.List;

public class Dtos {
    public record LoginReq(String email, String password) {}
    public record LoginResp(String token) {}
    public record MeResp(Long id, String name, String email, String role) {}

    public record GeneratePlanReq(String goal, Integer dailyMinutes, Integer weeks, String level) {}

    public record PhaseTaskDto(String id, String title, boolean done) {}
    public record PhaseDto(String id, int index, String title, String summary,
                           double progress, String status, List<PhaseTaskDto> tasks) {}
    public record PlanDto(String id, String title, String goal, int dailyMinutes, int weeks,
                          String level, String createdAt, double progress, List<PhaseDto> phases) {}

    public record TaskDto(String id, String title, String detail, int minutes,
                          String category, boolean done) {}

    public record CheckinResp(int streakDays, String checkedInAt) {}
}
