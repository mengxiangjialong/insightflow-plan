package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "plan")
public class Plan {
    @Id private String id;
    private Long userId;
    private String title;
    private String goal;
    private Integer dailyMinutes;
    private Integer weeks;
    private String level;
    private Double progress;
    private LocalDateTime createdAt;
}
