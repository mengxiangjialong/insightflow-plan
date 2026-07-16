package com.inkplan.service;

import com.inkplan.dto.Dtos;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final RedisTemplate<String, Object> redis;

    /** 使用 Redis SETNX 实现每日打卡去重，TTL 到当日结束。 */
    public Dtos.CheckinResp checkin(Long userId) {
        LocalDate today = LocalDate.now();
        String key = "inkplan:checkin:" + userId + ":" + today;
        Boolean ok = redis.opsForValue().setIfAbsent(key, 1,
                Duration.between(LocalDateTime.now(), today.atTime(LocalTime.MAX)));
        // TODO: 持久化到 checkin 表 + 计算连续天数
        int streak = 12 + (Boolean.TRUE.equals(ok) ? 1 : 0);
        return new Dtos.CheckinResp(streak, LocalDateTime.now().toString());
    }
}
