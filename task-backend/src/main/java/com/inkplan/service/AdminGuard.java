package com.inkplan.service;

import com.inkplan.domain.User;
import com.inkplan.repository.UserRepository;
import com.inkplan.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/** 管理员权限校验：仅 role=admin 可访问 /api/admin/**。 */
@Service
@RequiredArgsConstructor
public class AdminGuard {
    private final UserRepository users;

    public User require() {
        User u = users.findById(CurrentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (!"admin".equalsIgnoreCase(String.valueOf(u.getRole()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
        }
        return u;
    }
}
