package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "ai_prompt")
public class AiPrompt {
    @Id private String id;
    private String name;
    private String scene;
    @Column(length = 4000) private String content;
    private Boolean enabled;
    private LocalDateTime updatedAt;
}
