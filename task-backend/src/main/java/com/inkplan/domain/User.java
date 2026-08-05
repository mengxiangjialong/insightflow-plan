package com.inkplan.domain;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "user")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String email;
    private String password;
    private String name;
    private String role;
    /** active / banned */
    private String status;
    /** 登录方式：local / github */
    private String provider;
    /** 第三方账号唯一 ID（GitHub 用户 id） */
    private String providerId;
    private String avatarUrl;
    private LocalDateTime createdAt;
}
