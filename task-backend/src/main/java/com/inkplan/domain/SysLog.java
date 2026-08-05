package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "sys_log")
public class SysLog {
    @Id private String id;
    private Long userId;
    private String level;
    private String action;
    @Column(length = 1000) private String message;
    private LocalDateTime createdAt;
}
