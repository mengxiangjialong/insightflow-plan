package com.inkplan.service;

import com.inkplan.domain.Checkin;
import com.inkplan.domain.StudyRecord;
import com.inkplan.domain.TaskEntity;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.CheckinRepository;
import com.inkplan.repository.GoalRepository;
import com.inkplan.repository.StudyRecordRepository;
import com.inkplan.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 学习数据聚合服务：今日学习、学习日历（热力图）、成长曲线、连续天数。
 * 全部以 userId 过滤，日期一律取服务器当前系统时间。
 */
@Service
@RequiredArgsConstructor
public class StudyService {

    private final StudyRecordRepository records;
    private final TaskRepository tasks;
    private final CheckinRepository checkins;
    private final GoalRepository goals;

    public static final int DEFAULT_GOAL_MINUTES = 90;

    /** 任务完成时累计一条学习记录；取消完成时回滚。 */
    public void onTaskToggled(TaskEntity t) {
        LocalDate date = t.getTaskDate() == null ? LocalDate.now() : t.getTaskDate();
        if (Boolean.TRUE.equals(t.getDone())) {
            StudyRecord r = new StudyRecord();
            r.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            r.setUserId(t.getUserId());
            r.setStudyDate(date);
            r.setMinutes(t.getMinutes() == null ? 0 : t.getMinutes());
            r.setTitle(t.getTitle());
            r.setCategory(t.getCategory());
            r.setCreatedAt(LocalDateTime.now());
            records.save(r);
        } else {
            records.findByUserIdAndStudyDate(t.getUserId(), date).stream()
                    .filter(r -> Objects.equals(r.getTitle(), t.getTitle()))
                    .findFirst()
                    .ifPresent(records::delete);
        }
    }

    public int minutesOn(Long userId, LocalDate date) {
        return records.findByUserIdAndStudyDate(userId, date).stream()
                .mapToInt(r -> r.getMinutes() == null ? 0 : r.getMinutes()).sum();
    }

    public int goalMinutes(Long userId) {
        return goals.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .findFirst()
                .map(g -> g.getDailyMinutes() == null ? DEFAULT_GOAL_MINUTES : g.getDailyMinutes())
                .orElse(DEFAULT_GOAL_MINUTES);
    }

    /** 今日学习：已学时长、今日目标、完成率、连续天数、待办完成数。 */
    public Dtos.TodayStats today(Long userId) {
        LocalDate today = LocalDate.now();
        List<TaskEntity> todos = tasks.findByUserIdAndTaskDate(userId, today);
        int total = todos.size();
        int done = (int) todos.stream().filter(t -> Boolean.TRUE.equals(t.getDone())).count();
        int minutes = minutesOn(userId, today);
        int goal = goalMinutes(userId);
        double rate = total > 0 ? (double) done / total : (goal > 0 ? Math.min(1.0, (double) minutes / goal) : 0);
        return new Dtos.TodayStats(today.toString(), minutes, goal,
                Math.round(rate * 100) / 100.0, streak(userId), done, total);
    }

    /** 连续学习天数：从今天（或昨天）往前连续有学习记录/打卡的天数。 */
    public int streak(Long userId) {
        Set<LocalDate> days = new HashSet<>();
        LocalDate today = LocalDate.now();
        records.findByUserIdAndStudyDateBetweenOrderByStudyDateAsc(userId, today.minusDays(400), today)
                .forEach(r -> days.add(r.getStudyDate()));
        checkins.findByUserIdOrderByCheckinDateDesc(userId).forEach(c -> days.add(c.getCheckinDate()));
        LocalDate cursor = days.contains(today) ? today : today.minusDays(1);
        int n = 0;
        while (days.contains(cursor)) { n++; cursor = cursor.minusDays(1); }
        return n;
    }

    /** GitHub 风格贡献墙数据：最近 weeks 周，按天补零。 */
    public List<Dtos.HeatDay> heatmap(Long userId, int weeks) {
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays((long) weeks * 7 - 1);
        Map<LocalDate, Integer> byDay = new HashMap<>();
        records.findByUserIdAndStudyDateBetweenOrderByStudyDateAsc(userId, from, today).forEach(r ->
                byDay.merge(r.getStudyDate(), r.getMinutes() == null ? 0 : r.getMinutes(), Integer::sum));
        List<Dtos.HeatDay> out = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(today); d = d.plusDays(1)) {
            out.add(new Dtos.HeatDay(d.toString(), byDay.getOrDefault(d, 0)));
        }
        return out;
    }

    /** 成长曲线：最近 weeks 周每周累计小时。 */
    public List<Dtos.GrowthPoint> growth(Long userId, int weeks) {
        List<Dtos.HeatDay> heat = heatmap(userId, weeks);
        List<Dtos.GrowthPoint> out = new ArrayList<>();
        for (int w = 0; w < weeks; w++) {
            int mins = 0;
            for (int i = w * 7; i < Math.min((w + 1) * 7, heat.size()); i++) mins += heat.get(i).minutes();
            out.add(new Dtos.GrowthPoint("W" + (w + 1), Math.round(mins / 60.0 * 10) / 10.0));
        }
        return out;
    }

    /** 点击日历某一天查看详情。 */
    public Dtos.DayDetail day(Long userId, LocalDate date) {
        List<Dtos.StudyRecordDto> list = records.findByUserIdAndStudyDate(userId, date).stream()
                .map(r -> new Dtos.StudyRecordDto(r.getId(), r.getTitle(),
                        r.getMinutes() == null ? 0 : r.getMinutes(), r.getCategory(),
                        r.getCreatedAt() == null ? null : r.getCreatedAt().toString()))
                .toList();
        int minutes = list.stream().mapToInt(Dtos.StudyRecordDto::minutes).sum();
        boolean checked = checkins.findByUserIdAndCheckinDate(userId, date).isPresent();
        return new Dtos.DayDetail(date.toString(), minutes, checked, list);
    }

    public Dtos.StatsSummary summary(Long userId, int weeks) {
        List<Dtos.HeatDay> heat = heatmap(userId, weeks);
        int totalMinutes = heat.stream().mapToInt(Dtos.HeatDay::minutes).sum();
        int activeDays = (int) heat.stream().filter(d -> d.minutes() > 0).count();
        List<Dtos.HeatDay> lastWeek = heat.subList(Math.max(0, heat.size() - 7), heat.size());
        double weekProgress = lastWeek.isEmpty() ? 0
                : Math.min(1.0, lastWeek.stream().filter(d -> d.minutes() > 0).count() / 7.0);
        return new Dtos.StatsSummary(streak(userId),
                Math.round(totalMinutes / 60.0 * 10) / 10.0,
                Math.round(weekProgress * 100) / 100.0, activeDays);
    }

    /** 打卡：Redis 去重由 CheckinService 负责，这里做持久化。 */
    public Checkin persistCheckin(Long userId) {
        LocalDate today = LocalDate.now();
        return checkins.findByUserIdAndCheckinDate(userId, today).orElseGet(() -> {
            Checkin c = new Checkin();
            c.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            c.setUserId(userId);
            c.setCheckinDate(today);
            c.setMinutes(minutesOn(userId, today));
            c.setCreatedAt(LocalDateTime.now());
            return checkins.save(c);
        });
    }

    public boolean checkedInToday(Long userId) {
        return checkins.findByUserIdAndCheckinDate(userId, LocalDate.now()).isPresent();
    }
}
