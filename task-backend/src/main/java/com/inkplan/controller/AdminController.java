package com.inkplan.controller;

import com.inkplan.domain.*;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.*;
import com.inkplan.security.CurrentUser;
import com.inkplan.service.AdminGuard;
import com.inkplan.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 管理后台：用户管理 / 公告管理 / 分类管理 / AI Prompt 管理 / 数据统计 / 系统配置 / 日志查看。
 * 所有接口都先经过 AdminGuard 校验，仅 role=admin 可访问。
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminGuard guard;
    private final LogService logService;
    private final UserRepository users;
    private final PlanRepository plans;
    private final TaskRepository tasks;
    private final CheckinRepository checkins;
    private final AnnouncementRepository announcements;
    private final CategoryRepository categories;
    private final AiPromptRepository prompts;
    private final SystemConfigRepository configs;
    private final SysLogRepository logs;
    private final StudyRecordRepository records;

    // ---------- 数据统计 ----------
    @GetMapping("/stats")
    public Dtos.AdminStats stats() {
        guard.require();
        long active = records.countActiveUsersSince(LocalDate.now().minusDays(7));
        return new Dtos.AdminStats(users.count(), plans.count(), tasks.count(),
                checkins.countByCheckinDate(LocalDate.now()), active);
    }

    // ---------- 用户管理 ----------
    @GetMapping("/users")
    public List<Dtos.AdminUserDto> users() {
        guard.require();
        return users.findAll().stream().map(u -> new Dtos.AdminUserDto(u.getId(), u.getName(), u.getEmail(),
                u.getRole(), u.getStatus() == null ? "active" : u.getStatus(),
                u.getCreatedAt() == null ? null : u.getCreatedAt().toString())).toList();
    }

    @PutMapping("/users/{id}")
    public Dtos.AdminUserDto updateUser(@PathVariable Long id, @RequestBody Dtos.AdminUserReq req) {
        guard.require();
        User u = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.role() != null) u.setRole(req.role());
        if (req.status() != null) u.setStatus(req.status());
        users.save(u);
        logService.log(CurrentUser.id(), "WARN", "ADMIN_USER_UPDATE", "更新用户 " + u.getEmail());
        return new Dtos.AdminUserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.getStatus(), u.getCreatedAt() == null ? null : u.getCreatedAt().toString());
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        User admin = guard.require();
        if (admin.getId().equals(id)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "不能删除自己");
        users.deleteById(id);
        logService.log(admin.getId(), "WARN", "ADMIN_USER_DELETE", "删除用户 #" + id);
    }

    // ---------- 公告管理 ----------
    @GetMapping("/announcements")
    public List<Dtos.AnnouncementDto> announcements() {
        guard.require();
        return announcements.findAllByOrderByPinnedDescCreatedAtDesc().stream().map(a ->
                new Dtos.AnnouncementDto(a.getId(), a.getTitle(), a.getContent(),
                        Boolean.TRUE.equals(a.getPinned()),
                        a.getCreatedAt() == null ? null : a.getCreatedAt().toString())).toList();
    }

    @PostMapping("/announcements")
    public Dtos.AnnouncementDto createAnnouncement(@RequestBody Dtos.AnnouncementReq req) {
        guard.require();
        Announcement a = new Announcement();
        a.setId(newId());
        a.setTitle(req.title());
        a.setContent(req.content());
        a.setPinned(Boolean.TRUE.equals(req.pinned()));
        a.setCreatedAt(LocalDateTime.now());
        announcements.save(a);
        return new Dtos.AnnouncementDto(a.getId(), a.getTitle(), a.getContent(), a.getPinned(), a.getCreatedAt().toString());
    }

    @DeleteMapping("/announcements/{id}")
    public void deleteAnnouncement(@PathVariable String id) {
        guard.require();
        announcements.deleteById(id);
    }

    // ---------- 分类管理 ----------
    @GetMapping("/categories")
    public List<Dtos.CategoryDto> categories() {
        guard.require();
        return categories.findAll().stream()
                .map(c -> new Dtos.CategoryDto(c.getId(), c.getName(), c.getItemCount() == null ? 0 : c.getItemCount()))
                .toList();
    }

    @PostMapping("/categories")
    public Dtos.CategoryDto createCategory(@RequestBody Dtos.CategoryReq req) {
        guard.require();
        Category c = new Category();
        c.setId(newId());
        c.setName(req.name());
        c.setItemCount(0);
        categories.save(c);
        return new Dtos.CategoryDto(c.getId(), c.getName(), 0);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable String id) {
        guard.require();
        categories.deleteById(id);
    }

    // ---------- AI Prompt 管理 ----------
    @GetMapping("/prompts")
    public List<Dtos.PromptDto> prompts() {
        guard.require();
        return prompts.findAll().stream().map(p -> new Dtos.PromptDto(p.getId(), p.getName(), p.getScene(),
                p.getContent(), Boolean.TRUE.equals(p.getEnabled()),
                p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString())).toList();
    }

    @PostMapping("/prompts")
    public Dtos.PromptDto createPrompt(@RequestBody Dtos.PromptReq req) {
        guard.require();
        AiPrompt p = new AiPrompt();
        p.setId(newId());
        p.setName(req.name());
        p.setScene(req.scene());
        p.setContent(req.content());
        p.setEnabled(req.enabled() == null || req.enabled());
        p.setUpdatedAt(LocalDateTime.now());
        prompts.save(p);
        return new Dtos.PromptDto(p.getId(), p.getName(), p.getScene(), p.getContent(), p.getEnabled(),
                p.getUpdatedAt().toString());
    }

    @PutMapping("/prompts/{id}")
    public Dtos.PromptDto updatePrompt(@PathVariable String id, @RequestBody Dtos.PromptReq req) {
        guard.require();
        AiPrompt p = prompts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (req.name() != null) p.setName(req.name());
        if (req.scene() != null) p.setScene(req.scene());
        if (req.content() != null) p.setContent(req.content());
        if (req.enabled() != null) p.setEnabled(req.enabled());
        p.setUpdatedAt(LocalDateTime.now());
        prompts.save(p);
        return new Dtos.PromptDto(p.getId(), p.getName(), p.getScene(), p.getContent(), p.getEnabled(),
                p.getUpdatedAt().toString());
    }

    @DeleteMapping("/prompts/{id}")
    public void deletePrompt(@PathVariable String id) {
        guard.require();
        prompts.deleteById(id);
    }

    // ---------- 系统配置 ----------
    @GetMapping("/configs")
    public List<Dtos.ConfigDto> configs() {
        guard.require();
        return configs.findAll().stream()
                .map(c -> new Dtos.ConfigDto(c.getId(), c.getConfigKey(), c.getConfigValue(), c.getDescription()))
                .toList();
    }

    @PostMapping("/configs")
    public Dtos.ConfigDto upsertConfig(@RequestBody Dtos.ConfigReq req) {
        guard.require();
        SystemConfig c = configs.findByConfigKey(req.key()).orElseGet(() -> {
            SystemConfig n = new SystemConfig();
            n.setId(newId());
            n.setConfigKey(req.key());
            return n;
        });
        c.setConfigValue(req.value());
        if (req.description() != null) c.setDescription(req.description());
        configs.save(c);
        logService.log(CurrentUser.id(), "INFO", "ADMIN_CONFIG", "配置 " + req.key() + " = " + req.value());
        return new Dtos.ConfigDto(c.getId(), c.getConfigKey(), c.getConfigValue(), c.getDescription());
    }

    // ---------- 日志查看 ----------
    @GetMapping("/logs")
    public List<Dtos.LogDto> logs() {
        guard.require();
        return logs.findTop200ByOrderByCreatedAtDesc().stream().map(l -> new Dtos.LogDto(l.getId(), l.getUserId(),
                l.getLevel(), l.getAction(), l.getMessage(),
                l.getCreatedAt() == null ? null : l.getCreatedAt().toString())).toList();
    }

    private static String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
