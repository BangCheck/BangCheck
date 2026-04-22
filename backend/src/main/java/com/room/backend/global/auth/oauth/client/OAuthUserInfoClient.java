package com.room.backend.global.auth.oauth.client;

import com.room.backend.global.auth.oauth.dto.google.GoogleOAuthProperties;
import com.room.backend.global.auth.oauth.dto.google.GoogleUserInfoResponseDTO;
import com.room.backend.global.auth.oauth.dto.naver.NaverOAuthProperties;
import com.room.backend.global.auth.oauth.dto.naver.NaverUserInfoResponseDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OAuthUserInfoClient {

    private final RestClient restClient;
    private final NaverOAuthProperties naverProps;
    private final GoogleOAuthProperties googleProps;

    public OAuthUserInfoClient(
            RestClient restClient,
            NaverOAuthProperties naverProps,
            GoogleOAuthProperties googleProps
    ) {
        this.restClient = restClient;
        this.naverProps = naverProps;
        this.googleProps = googleProps;
    }

    public NaverUserInfoResponseDTO fetchNaverUserInfo(String accessToken) {
        return restClient.get()
                .uri(naverProps.userInfoUri())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(NaverUserInfoResponseDTO.class);
    }

    public GoogleUserInfoResponseDTO fetchGoogleUserInfo(String accessToken) {
        return restClient.get()
                .uri(googleProps.userInfoUri())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .body(GoogleUserInfoResponseDTO.class);
    }
}
