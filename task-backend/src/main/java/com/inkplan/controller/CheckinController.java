package com.inkplan.controller;

import com.inkplan.dto.Dtos;
import com.inkplan.security.CurrentUser;
import com.inkplan.service.CheckinService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinService checkinService;

    @PostMapping
    public Dtos.CheckinResp checkin() { return checkinService.checkin(CurrentUser.id()); }

    @GetMapping
    public Dtos.CheckinResp status() { return checkinService.status(CurrentUser.id()); }
}
