package com.inkplan.service;

import com.inkplan.domain.SysLog;
import com.inkplan.repository.SysLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LogService {
    private final SysLogRepository logs;

    public void log(Long userId, String level, String action, String message) {
        SysLog l = new SysLog();
        l.setId(UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        l.setUserId(userId);
        l.setLevel(level);
        l.setAction(action);
        l.setMessage(message);
        l.setCreatedAt(LocalDateTime.now());
        logs.save(l);
    }
}
