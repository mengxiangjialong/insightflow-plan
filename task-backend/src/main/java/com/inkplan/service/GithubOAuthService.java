package com.inkplan.service;

import com.inkplan.domain.User;
import com.inkplan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** GitHub OAuth2 授权码流程：换取 access_token -> 拉取用户信息 -> upsert 本地用户。 */
@Service
@RequiredArgsConstructor
public class GithubOAuthService {

    private static final String AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
    private static final String TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String USER_URL = "https://api.github.com/user";
    private static final String EMAILS_URL = "https://api.github.com/user/emails";

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final RestTemplate rest = new RestTemplate();

    @Value("${inkplan.github.client-id:}")
    private String clientId;
    @Value("${inkplan.github.client-secret:}")
    private String clientSecret;
    @Value("${inkplan.github.redirect-uri:http://localhost:8080/api/auth/github/callback}")
    private String redirectUri;

    public boolean enabled() {
        return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
    }

    public String authorizeUrl(String state) {
        return AUTHORIZE_URL
                + "?client_id=" + enc(clientId)
                + "&redirect_uri=" + enc(redirectUri)
                + "&scope=" + enc("read:user user:email")
                + "&state=" + enc(state)
                + "&allow_signup=true";
    }

    /** 用授权码换取 GitHub access_token。 */
    public String exchangeCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("code", code);
        form.add("redirect_uri", redirectUri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        @SuppressWarnings("unchecked")
        Map<String, Object> body = rest.postForObject(TOKEN_URL, new HttpEntity<>(form, headers), Map.class);
        if (body == null || body.get("access_token") == null) {
            throw new IllegalStateException("GitHub 授权失败：" + (body == null ? "empty" : body.get("error")));
        }
        return String.valueOf(body.get("access_token"));
    }

    /** 拉取 GitHub 用户信息，并在本地库中创建或更新用户。 */
    public User upsertUser(String accessToken) {
        Map<String, Object> gh = get(USER_URL, accessToken);
        String providerId = String.valueOf(gh.get("id"));
        String login = String.valueOf(gh.getOrDefault("login", "github-user"));
        String name = gh.get("name") == null ? login : String.valueOf(gh.get("name"));
        String avatar = gh.get("avatar_url") == null ? null : String.valueOf(gh.get("avatar_url"));
        String email = gh.get("email") == null ? primaryEmail(accessToken, login) : String.valueOf(gh.get("email"));

        User u = users.findByProviderAndProviderId("github", providerId)
                .or(() -> users.findByEmail(email))
                .orElseGet(User::new);
        if (u.getId() == null) {
            u.setPassword(encoder.encode(UUID.randomUUID().toString()));
            u.setRole("user");
            u.setCreatedAt(LocalDateTime.now());
        }
        u.setEmail(email);
        u.setName(name);
        u.setProvider("github");
        u.setProviderId(providerId);
        u.setAvatarUrl(avatar);
        return users.save(u);
    }

    private String primaryEmail(String accessToken, String login) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> list = rest.exchange(EMAILS_URL, HttpMethod.GET,
                    new HttpEntity<>(bearer(accessToken)), List.class).getBody();
            if (list != null) {
                for (Map<String, Object> e : list) {
                    if (Boolean.TRUE.equals(e.get("primary")) && e.get("email") != null) {
                        return String.valueOf(e.get("email"));
                    }
                }
            }
        } catch (Exception ignored) { /* 邮箱不可见时回退 */ }
        return login + "@users.noreply.github.com";
    }

    private Map<String, Object> get(String url, String accessToken) {
        @SuppressWarnings("unchecked")
        Map<String, Object> body = rest.exchange(url, HttpMethod.GET,
                new HttpEntity<>(bearer(accessToken)), Map.class).getBody();
        if (body == null) throw new IllegalStateException("GitHub 用户信息为空");
        return body;
    }

    private HttpHeaders bearer(String accessToken) {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(accessToken);
        h.setAccept(List.of(MediaType.APPLICATION_JSON));
        h.set("X-GitHub-Api-Version", "2022-11-28");
        return h;
    }

    private static String enc(String v) { return URLEncoder.encode(v, StandardCharsets.UTF_8); }
}
