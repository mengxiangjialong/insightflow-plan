package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;

@Data @Entity @Table(name = "category")
public class Category {
    @Id private String id;
    private String name;
    private Integer itemCount;
}
