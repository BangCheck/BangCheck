package com.room.backend.api.auth.controller;

import com.room.backend.api.auth.dto.request.MergeGuestDataRequestDTO;
import com.room.backend.api.auth.dto.response.GuestTokenResponseDTO;
import com.room.backend.api.auth.dto.response.OAuthCallbackResponseDTO;
import com.room.backend.api.auth.dto.result.OAuthCallbackResult;
import com.room.backend.api.auth.dto.result.TokenPair;
import com.room.backend.api.auth.exception.AuthErrorCode;
import com.room.backend.api.auth.service.AuthService;
import com.room.backend.global.auth.cookie.CookieProvider;
import com.room.backend.global.auth.jwt.JwtProvider;
import com.room.backend.global.auth.oauth.dto.oauth.OAuthAuthorizeResponseDTO;
import com.room.backend.global.auth.oauth.service.OAuthService;
import com.room.backend.global.auth.util.SecurityUtil;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("${app.paths.auth-base-path}")
@RequiredArgsConstructor
public class AuthController {

    private final OAuthService oauthService;
    private final AuthService authService;
    private final CookieProvider cookieProvider;
    private final JwtProvider jwtProvider;

    @GetMapping("${app.paths.auth-oauth-base-path}/{provider}")
    public ResponseEntity<ApiResponse<OAuthAuthorizeResponseDTO>> authorize(@PathVariable String provider) {
        OAuthAuthorizeResponseDTO data = oauthService.buildAuthorizeUrl(provider);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("${app.paths.auth-oauth-base-path}/{provider}/callback")
    public ResponseEntity<ApiResponse<OAuthCallbackResponseDTO>> callback(
            @PathVariable String provider,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error
    ) {
        if (StringUtils.hasText(error)) {
            throw new GeneralException(AuthErrorCode.OAUTH_USER_DENIED);
        }
        if (!StringUtils.hasText(code) || !StringUtils.hasText(state)) {
            throw new GeneralException(AuthErrorCode.INVALID_STATE);
        }

        oauthService.validateState(state);

        OAuthCallbackResult result = authService.handleOAuthCallback(provider, code, state);

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + result.accessToken())
                .header(HttpHeaders.SET_COOKIE, cookieProvider.createRefreshTokenCookie(result.refreshToken()).toString())
                .body(ApiResponse.success(result.response()));
    }

    @PostMapping("/guest")
    public ResponseEntity<ApiResponse<GuestTokenResponseDTO>> guest() {
        JwtProvider.GuestToken guestToken = jwtProvider.generateGuestToken();
        GuestTokenResponseDTO response = GuestTokenResponseDTO.of(guestToken.guestId(), guestToken.accessToken());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("${app.paths.auth-refresh-path}")
    public ResponseEntity<ApiResponse<Void>> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshToken
    ) {
        TokenPair tokenPair = authService.refresh(refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenPair.accessToken())
                .header(HttpHeaders.SET_COOKIE, cookieProvider.createRefreshTokenCookie(tokenPair.refreshToken()).toString())
                .body(ApiResponse.success(null));
    }

    @PostMapping("${app.paths.auth-logout-path}")
    public ResponseEntity<ApiResponse<Void>> logout() {
        Long userId = SecurityUtil.getCurrentUserId();
        authService.logout(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieProvider.expireRefreshTokenCookie().toString())
                .body(ApiResponse.success(null));
    }

    @PostMapping("/merge-guest-data")
    public ResponseEntity<ApiResponse<Void>> mergeGuestData(@RequestBody MergeGuestDataRequestDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        authService.mergeGuestData(userId, request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
