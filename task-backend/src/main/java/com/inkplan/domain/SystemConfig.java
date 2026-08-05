package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;

@Data @Entity @Table(name = "system_config")
public class SystemConfig {
    @Id private String id;
    private String configKey;
    @Column(length = 2000) private String configValue;
    private String description;
}
