package com.room.backend.global.config;

import com.room.backend.global.auth.jwt.filter.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final AppPathProperties appPathProperties;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, AppPathProperties appPathProperties) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.appPathProperties = appPathProperties;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
                http.csrf(csrf -> csrf.disable());

                http.authorizeHttpRequests(auth -> auth
                                // Preflight
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                // Public — 인증 불필요
                                .requestMatchers(appPathProperties.getAuthBasePath()
                                                + appPathProperties.getAuthOauthBasePath() + "/**")
                                .permitAll()

                                .requestMatchers("/oauth2/authorization/**").permitAll() // 추가
                                .requestMatchers("/login/oauth2/code/**").permitAll() // 추가

                                .requestMatchers(appPathProperties.getAuthBasePath()
                                                + appPathProperties.getAuthRefreshPath())
                                .permitAll()
                                .requestMatchers(appPathProperties.getSwaggerUiPath(), "/swagger-ui/**",
                                                appPathProperties.getApiDocsPath(),
                                                appPathProperties.getApiDocsPath() + "/**", "/webjars/**")
                                .permitAll()

                                // Guest — 비로그인도 허용할 엔드포인트
                                .requestMatchers(HttpMethod.GET, "/api/v1/address/search").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/directions/walking").permitAll()

                                // Authenticated — 반드시 로그인 필요
                                .requestMatchers(appPathProperties.getAuthBasePath()
                                                + appPathProperties.getAuthLogoutPath())
                                .authenticated()
                                .anyRequest().authenticated());

                http.formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

                http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                http.exceptionHandling(e -> e
                                .authenticationEntryPoint((request, response, authException) -> {
                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                        response.setContentType("application/json;charset=UTF-8");
                                        response.getWriter().write("{\"success\":false,\"code\":\"AUTH_401\",\"message\":\"Unauthorized\"}");
                                })
                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                        response.setContentType("application/json;charset=UTF-8");
                                        response.getWriter().write("{\"success\":false,\"code\":\"AUTH_403\",\"message\":\"Forbidden\"}");
                                }));

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(appPathProperties.getCorsAllowedOrigins());
                config.setAllowCredentials(true);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(
                                List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
                config.setExposedHeaders(List.of("Authorization"));
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
