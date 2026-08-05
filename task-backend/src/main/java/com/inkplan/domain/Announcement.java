package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "announcement")
public class Announcement {
    @Id private String id;
    private String title;
    @Column(length = 2000) private String content;
    private Boolean pinned;
    private LocalDateTime createdAt;
}
