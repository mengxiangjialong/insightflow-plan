package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "checkin")
public class Checkin {
    @Id private String id;
    private Long userId;
    private LocalDate checkinDate;
    private Integer minutes;
    private LocalDateTime createdAt;
}
