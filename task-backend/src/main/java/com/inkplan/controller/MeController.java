package com.inkplan.controller;

import com.inkplan.domain.User;
import com.inkplan.dto.Dtos;
import com.inkplan.repository.UserRepository;
import com.inkplan.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class MeController {
    private final UserRepository users;

    @GetMapping
    public Dtos.MeResp me() {
        User u = users.findById(CurrentUser.id()).orElseThrow();
        return new Dtos.MeResp(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }
}
