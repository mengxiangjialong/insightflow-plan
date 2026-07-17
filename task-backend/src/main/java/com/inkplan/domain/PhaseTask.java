package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;

@Data @Entity @Table(name = "phase_task")
public class PhaseTask {
    @Id private String id;
    private String phaseId;
    private String title;
    private Boolean done;
}
