package com.room.backend.global.auth.oauth.client;

import com.room.backend.global.auth.oauth.dto.google.GoogleOAuthProperties;
import com.room.backend.global.auth.oauth.dto.naver.NaverOAuthProperties;
import com.room.backend.global.auth.oauth.dto.oauth.OAuthTokenResponseDTO;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class OAuthTokenClient {

    private final RestClient restClient;
    private final NaverOAuthProperties naverProps;
    private final GoogleOAuthProperties googleProps;

    public OAuthTokenClient(
            RestClient restClient,
            NaverOAuthProperties naverProps,
            GoogleOAuthProperties googleProps
    ) {
        this.restClient = restClient;
        this.naverProps = naverProps;
        this.googleProps = googleProps;
    }

    public OAuthTokenResponseDTO exchangeNaverCodeForToken(String code, String state) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", naverProps.clientId());
        form.add("redirect_uri", naverProps.redirectUri());
        form.add("code", code);
        form.add("state", state);

        if (naverProps.clientSecret() != null && !naverProps.clientSecret().isBlank()) {
            form.add("client_secret", naverProps.clientSecret());
        }

        return restClient.post()
                .uri(naverProps.tokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(OAuthTokenResponseDTO.class);
    }

    public OAuthTokenResponseDTO exchangeGoogleCodeForToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", googleProps.clientId());
        form.add("client_secret", googleProps.clientSecret());
        form.add("redirect_uri", googleProps.redirectUri());
        form.add("code", code);

        return restClient.post()
                .uri(googleProps.tokenUri())
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(OAuthTokenResponseDTO.class);
    }
}
