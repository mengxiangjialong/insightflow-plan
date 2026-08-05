package com.inkplan.controller;

import com.inkplan.domain.User;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.UserRepository;
import com.inkplan.security.JwtService;
import com.inkplan.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
    private static final String ADMIN_EMAIL = "admin@163.com";

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final LogService logs;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Dtos.LoginReq req) {
        String email = req.email() == null ? "" : req.email().trim().toLowerCase();
        if (!EMAIL.matcher(email).matches()) return ResponseEntity.badRequest().body("邮箱格式不正确");
        User u = users.findByEmail(email).orElse(null);
        if (u == null || u.getPassword() == null || !encoder.matches(req.password(), u.getPassword())) {
            return ResponseEntity.status(401).body("邮箱或密码错误");
        }
        if ("banned".equals(u.getStatus())) return ResponseEntity.status(403).body("账号已被禁用");
        logs.log(u.getId(), "INFO", "LOGIN", email + " 登录成功");
        return ResponseEntity.ok(new Dtos.LoginResp(jwt.issue(u.getId(), u.getEmail())));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Dtos.RegisterReq req) {
        String email = req.email() == null ? "" : req.email().trim().toLowerCase();
        if (req.name() == null || req.name().isBlank()) return ResponseEntity.badRequest().body("请填写昵称");
        if (!EMAIL.matcher(email).matches()) return ResponseEntity.badRequest().body("邮箱格式不正确");
        if (ADMIN_EMAIL.equals(email)) return ResponseEntity.badRequest().body("该邮箱为系统保留账号");
        if (req.password() == null || req.password().length() < 6) return ResponseEntity.badRequest().body("密码至少 6 位");
        if (users.findByEmail(email).isPresent()) return ResponseEntity.status(409).body("该邮箱已注册");

        User u = new User();
        u.setEmail(email);
        u.setName(req.name().trim());
        u.setPassword(encoder.encode(req.password()));
        u.setRole("user");
        u.setStatus("active");
        u.setProvider("local");
        u.setCreatedAt(LocalDateTime.now());
        users.save(u);
        logs.log(u.getId(), "INFO", "REGISTER", email + " 注册成功");
        return ResponseEntity.ok(new Dtos.LoginResp(jwt.issue(u.getId(), u.getEmail())));
    }
}
