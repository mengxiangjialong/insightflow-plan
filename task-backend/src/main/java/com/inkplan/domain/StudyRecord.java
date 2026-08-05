package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 单条学习记录：用于学习日历（GitHub 贡献墙）与统计。 */
@Data @Entity @Table(name = "study_record")
public class StudyRecord {
    @Id private String id;
    private Long userId;
    private LocalDate studyDate;
    private Integer minutes;
    private String title;
    private String category;
    private LocalDateTime createdAt;
}
