package com.room.backend.baseline;

import com.room.backend.BackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ObservableBaselineContractTest {

    @Test
    void javaMajorSourceMatchesTheGradleToolchain() throws IOException {
        String javaMajor = Files.readString(Path.of(".java-version"), StandardCharsets.UTF_8).trim();
        String buildScript = Files.readString(Path.of("build.gradle"), StandardCharsets.UTF_8);

        assertTrue(javaMajor.matches("[0-9]+"));
        assertTrue(buildScript.contains("JavaLanguageVersion.of(" + javaMajor + ")"));
    }

    @Test
    void runtimePolicyResolvesVirtualThreadsToFalse() throws IOException {
        StandardEnvironment environment = new StandardEnvironment();
        YamlPropertySourceLoader loader = new YamlPropertySourceLoader();
        loader.load("application", new ClassPathResource("application.yaml"))
                .forEach(environment.getPropertySources()::addLast);

        assertEquals("com.room.backend.BackendApplication", BackendApplication.class.getName());
        assertFalse(environment.getProperty("spring.threads.virtual.enabled", Boolean.class, true));
    }
}
