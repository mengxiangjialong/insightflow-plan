package com.inkplan.controller;

import com.inkplan.domain.TaskEntity;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.TaskRepository;
import com.inkplan.security.CurrentUser;
import com.inkplan.service.StudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * 今日待办：查询 / 新增 / 修改 / 删除 / 打勾。
 * 日期一律取服务器当前系统日期，所有操作按 JWT userId 隔离。
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository tasks;
    private final StudyService study;

    private static final List<String> DEFAULT_TODOS = List.of("Spring Boot", "Redis", "算法", "英语");

    @GetMapping("/today")
    public List<Dtos.TaskDto> today() {
        Long uid = CurrentUser.id();
        LocalDate today = LocalDate.now();
        List<TaskEntity> list = tasks.findByUserIdAndTaskDate(uid, today);
        if (list.isEmpty()) {
            for (String title : DEFAULT_TODOS) {
                TaskEntity t = new TaskEntity();
                t.setId(newId());
                t.setUserId(uid);
                t.setTitle(title);
                t.setDetail("今日学习任务");
                t.setMinutes(30);
                t.setCategory("PRACTICE");
                t.setDone(false);
                t.setStatus("TODO");
                t.setTaskDate(today);
                tasks.save(t);
            }
            list = tasks.findByUserIdAndTaskDate(uid, today);
        }
        return list.stream().map(this::toDto).toList();
    }

    @PostMapping
    public Dtos.TaskDto create(@RequestBody Dtos.TaskReq req) {
        if (req.title() == null || req.title().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        }
        TaskEntity t = new TaskEntity();
        t.setId(newId());
        t.setUserId(CurrentUser.id());
        t.setTitle(req.title().trim());
        t.setDetail(req.detail());
        t.setMinutes(req.minutes() == null ? 30 : Math.min(600, Math.max(1, req.minutes())));
        t.setCategory(req.category() == null ? "PRACTICE" : req.category());
        t.setDone(false);
        t.setStatus("TODO");
        t.setTaskDate(LocalDate.now());
        return toDto(tasks.save(t));
    }

    @PutMapping("/{id}")
    public Dtos.TaskDto update(@PathVariable String id, @RequestBody Dtos.TaskReq req) {
        TaskEntity t = owned(id);
        if (req.title() != null && !req.title().isBlank()) t.setTitle(req.title().trim());
        if (req.detail() != null) t.setDetail(req.detail());
        if (req.minutes() != null) t.setMinutes(Math.min(600, Math.max(1, req.minutes())));
        if (req.category() != null) t.setCategory(req.category());
        return toDto(tasks.save(t));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        tasks.delete(owned(id));
    }

    @PostMapping("/{id}/toggle")
    public Dtos.TaskDto toggle(@PathVariable String id) {
        TaskEntity t = owned(id);
        boolean done = !Boolean.TRUE.equals(t.getDone());
        t.setDone(done);
        t.setStatus(done ? "DONE" : "TODO");
        tasks.save(t);
        study.onTaskToggled(t);
        return toDto(t);
    }

    /** 更新任务状态：TODO / DOING / DONE。DONE 与 done 字段保持一致并同步学习记录。 */
    @PutMapping("/{id}/status")
    public Dtos.TaskDto setStatus(@PathVariable String id, @RequestBody Dtos.TaskStatusReq req) {
        String status = req.status() == null ? "" : req.status().trim().toUpperCase();
        if (!List.of("TODO", "DOING", "DONE").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be TODO/DOING/DONE");
        }
        TaskEntity t = owned(id);
        boolean wasDone = Boolean.TRUE.equals(t.getDone());
        boolean nowDone = "DONE".equals(status);
        t.setStatus(status);
        t.setDone(nowDone);
        tasks.save(t);
        if (wasDone != nowDone) study.onTaskToggled(t);
        return toDto(t);
    }

    private TaskEntity owned(String id) {
        Long uid = CurrentUser.id();
        return tasks.findById(id)
                .filter(t -> uid.equals(t.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    private Dtos.TaskDto toDto(TaskEntity t) {
        return new Dtos.TaskDto(t.getId(), t.getTitle(), t.getDetail(),
                t.getMinutes() == null ? 0 : t.getMinutes(), t.getCategory(),
                Boolean.TRUE.equals(t.getDone()),
                t.getStatus() == null ? (Boolean.TRUE.equals(t.getDone()) ? "DONE" : "TODO") : t.getStatus());
    }

    private static String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
