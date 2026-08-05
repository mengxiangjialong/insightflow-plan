package com.inkplan.service;

import com.inkplan.dto.Dtos;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** 打卡：Redis SETNX 做当日去重，MySQL 持久化并计算连续天数。 */
@Service
@RequiredArgsConstructor
public class CheckinService {

    private final RedisTemplate<String, Object> redis;
    private final StudyService study;
    private final LogService logs;

    public Dtos.CheckinResp checkin(Long userId) {
        LocalDate today = LocalDate.now();
        String key = "inkplan:checkin:" + userId + ":" + today;
        redis.opsForValue().setIfAbsent(key, 1,
                Duration.between(LocalDateTime.now(), today.atTime(LocalTime.MAX)));
        var c = study.persistCheckin(userId);
        logs.log(userId, "INFO", "CHECKIN", "打卡 " + today);
        return new Dtos.CheckinResp(study.streak(userId),
                c.getCreatedAt() == null ? LocalDateTime.now().toString() : c.getCreatedAt().toString(), true);
    }

    public Dtos.CheckinResp status(Long userId) {
        boolean done = study.checkedInToday(userId);
        return new Dtos.CheckinResp(study.streak(userId), LocalDateTime.now().toString(), done);
    }
}
