package com.room.backend.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.paths")
public class AppPathProperties {

    private String authBasePath;
    private String authOauthBasePath;
    private String authRefreshPath;
    private String authLogoutPath;
    private String swaggerUiPath;
    private String apiDocsPath;
    private String flywayLocations;
    private List<String> corsAllowedOrigins;

    private Oauth oauth = new Oauth();

    @Getter
    @Setter
    public static class Oauth {
        private String naverRedirectUri;
        private String googleRedirectUri;
    }
}