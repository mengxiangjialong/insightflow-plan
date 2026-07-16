package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;

@Data @Entity @Table(name = "phase")
public class Phase {
    @Id private String id;
    private String planId;
    @Column(name = "idx") private Integer index;
    private String title;
    private String summary;
    private Double progress;
    private String status;
}
