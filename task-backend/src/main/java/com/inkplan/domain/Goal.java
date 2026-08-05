package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/** 学习目标。 */
@Data @Entity @Table(name = "goal")
public class Goal {
    @Id private String id;
    private Long userId;
    private String title;
    private String description;
    private Integer dailyMinutes;
    private Integer weeks;
    private String level;
    private String status;
    private LocalDateTime createdAt;
}
