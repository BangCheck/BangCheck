package com.room.backend.global.auth.oauth.config;

import com.room.backend.global.auth.oauth.dto.google.GoogleOAuthProperties;
import com.room.backend.global.auth.oauth.dto.naver.NaverOAuthProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        NaverOAuthProperties.class,
        GoogleOAuthProperties.class
})
public class OAuthPropertiesConfig {
}
