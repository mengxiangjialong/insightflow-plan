package com.inkplan.controller;

import com.inkplan.domain.User;
import com.inkplan.security.JwtService;
import com.inkplan.service.GithubOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * GitHub 账号登录：
 *   GET /api/auth/github/url       -> { url }            前端跳转该地址完成授权
 *   GET /api/auth/github/callback  -> 302 前端回调页 ?token=JWT
 */
@RestController
@RequestMapping("/api/auth/github")
@RequiredArgsConstructor
public class GithubAuthController {

    private static final String STATE_KEY = "inkplan:oauth:state:";

    private final GithubOAuthService github;
    private final JwtService jwt;
    private final StringRedisTemplate redis;

    @Value("${inkplan.github.frontend-callback:http://localhost:5173/oauth/github}")
    private String frontendCallback;

    @GetMapping("/url")
    public ResponseEntity<?> url() {
        if (!github.enabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "GitHub 登录未配置：请设置 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET"));
        }
        String state = UUID.randomUUID().toString();
        redis.opsForValue().set(STATE_KEY + state, "1", 10, TimeUnit.MINUTES);
        return ResponseEntity.ok(Map.of("url", github.authorizeUrl(state)));
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam(required = false) String code,
                                         @RequestParam(required = false) String state,
                                         @RequestParam(required = false) String error) {
        if (error != null || code == null || state == null) {
            return redirect(frontendCallback + "?error=" + enc(error == null ? "missing_code" : error));
        }
        Boolean valid = redis.delete(STATE_KEY + state);
        if (!Boolean.TRUE.equals(valid)) {
            return redirect(frontendCallback + "?error=invalid_state");
        }
        try {
            User u = github.upsertUser(github.exchangeCode(code));
            String token = jwt.issue(u.getId(), u.getEmail());
            return redirect(frontendCallback + "?token=" + enc(token));
        } catch (Exception e) {
            return redirect(frontendCallback + "?error=" + enc(e.getMessage() == null ? "oauth_failed" : e.getMessage()));
        }
    }

    private ResponseEntity<Void> redirect(String location) {
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(location)).build();
    }

    private static String enc(String v) { return URLEncoder.encode(v, StandardCharsets.UTF_8); }
}
