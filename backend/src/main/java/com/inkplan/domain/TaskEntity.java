package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data @Entity @Table(name = "task")
public class TaskEntity {
    @Id private String id;
    private Long userId;
    private String planId;
    private String title;
    private String detail;
    private Integer minutes;
    private String category;
    private Boolean done;
    private LocalDate taskDate;
}
