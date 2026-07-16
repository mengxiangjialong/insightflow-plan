package com.inkplan.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() {}
    public static Long id() {
        Object p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return (Long) p;
    }
}
