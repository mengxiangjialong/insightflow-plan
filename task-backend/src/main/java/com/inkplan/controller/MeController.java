package com.inkplan.controller;

import com.inkplan.domain.User;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.UserRepository;
import com.inkplan.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
    private final UserRepository users;

    @GetMapping
    public Dtos.MeResp me() { return toDto(current()); }

    /** 修改个人信息（昵称 / 邮箱 / 头像）。 */
    @PutMapping
    public Dtos.MeResp update(@RequestBody Dtos.UpdateMeReq req) {
        User u = current();
        if (req.name() != null && !req.name().isBlank()) u.setName(req.name().trim());
        if (req.email() != null && !req.email().isBlank()) {
            String mail = req.email().trim().toLowerCase();
            if (!EMAIL.matcher(mail).matches()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "邮箱格式不正确");
            }
            users.findByEmail(mail)
                    .filter(other -> !other.getId().equals(u.getId()))
                    .ifPresent(other -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "该邮箱已被使用"); });
            u.setEmail(mail);
        }
        if (req.avatarUrl() != null) u.setAvatarUrl(req.avatarUrl());
        return toDto(users.save(u));
    }

    private User current() {
        return users.findById(CurrentUser.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private Dtos.MeResp toDto(User u) {
        return new Dtos.MeResp(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getAvatarUrl(), u.getProvider());
    }
}
