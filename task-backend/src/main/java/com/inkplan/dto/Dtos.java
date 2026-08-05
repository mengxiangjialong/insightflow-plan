package com.inkplan.dto;

import java.util.List;

public class Dtos {
    // ---- auth / me ----
    public record LoginReq(String email, String password) {}
    public record RegisterReq(String name, String email, String password) {}
    public record LoginResp(String token) {}
    public record MeResp(Long id, String name, String email, String role, String avatarUrl, String provider) {}
    public record UpdateMeReq(String name, String email, String avatarUrl) {}

    // ---- plans ----
    public record GeneratePlanReq(String goal, Integer dailyMinutes, Integer weeks, String level) {}
    public record PhaseTaskDto(String id, String title, boolean done) {}
    public record PhaseDto(String id, int index, String title, String summary,
                           double progress, String status, List<PhaseTaskDto> tasks) {}
    public record PlanDto(String id, String title, String goal, int dailyMinutes, int weeks,
                          String level, String createdAt, double progress, List<PhaseDto> phases) {}

    // ---- goals ----
    public record GoalReq(String title, String description, Integer dailyMinutes, Integer weeks, String level) {}
    public record GoalDto(String id, String title, String description, int dailyMinutes,
                          int weeks, String level, String status, String createdAt) {}

    // ---- tasks ----
    public record TaskDto(String id, String title, String detail, int minutes,
                          String category, boolean done) {}
    public record TaskReq(String title, String detail, Integer minutes, String category) {}

    // ---- checkin ----
    public record CheckinResp(int streakDays, String checkedInAt, boolean checkedIn) {}

    // ---- stats ----
    public record TodayStats(String date, int minutes, int goalMinutes, double completionRate,
                             int streakDays, int doneTasks, int totalTasks) {}
    public record HeatDay(String date, int minutes) {}
    public record GrowthPoint(String week, double hours) {}
    public record StudyRecordDto(String id, String title, int minutes, String category, String createdAt) {}
    public record DayDetail(String date, int minutes, boolean checkedIn, List<StudyRecordDto> records) {}
    public record StatsSummary(int streakDays, double focusHours, double weekProgress, int activeDays) {}

    // ---- admin ----
    public record AdminUserDto(Long id, String name, String email, String role,
                               String status, String joinedAt) {}
    public record AdminUserReq(String role, String status) {}
    public record AnnouncementDto(String id, String title, String content, boolean pinned, String createdAt) {}
    public record AnnouncementReq(String title, String content, Boolean pinned) {}
    public record CategoryDto(String id, String name, int count) {}
    public record CategoryReq(String name) {}
    public record PromptDto(String id, String name, String scene, String content, boolean enabled, String updatedAt) {}
    public record PromptReq(String name, String scene, String content, Boolean enabled) {}
    public record ConfigDto(String id, String key, String value, String description) {}
    public record ConfigReq(String key, String value, String description) {}
    public record LogDto(String id, Long userId, String level, String action, String message, String createdAt) {}
    public record AdminStats(long users, long plans, long tasks, long checkinsToday, long activeUsers7d) {}
}
