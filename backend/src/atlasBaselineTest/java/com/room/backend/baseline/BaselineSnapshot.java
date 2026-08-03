package com.room.backend.baseline;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

final class BaselineSnapshot {

    private static final String MODE = System.getProperty("atlas.baseline.mode", "compare");
    private static final Path ORACLE_DIRECTORY =
            Path.of(requiredProperty("atlas.baseline.directory"));
    private static final Path INFORMATION_DIRECTORY =
            Path.of(requiredProperty("atlas.baseline.info-directory"));

    private BaselineSnapshot() {
    }

    static void oracle(String fileName, Collection<String> records) {
        String actual = normalized(records);
        Path target = ORACLE_DIRECTORY.resolve(fileName);

        if ("capture".equals(MODE)) {
            write(target, actual);
            return;
        }
        if (!"compare".equals(MODE)) {
            throw new IllegalStateException("Unsupported Atlas baseline mode: " + MODE);
        }

        try {
            if (Files.notExists(target)) {
                fail("Missing approved Atlas product oracle: " + target);
            }
            String expected = Files.readString(target, StandardCharsets.UTF_8)
                    .replace("\r\n", "\n");
            assertEquals(expected, actual,
                    "Atlas product oracle drift in " + fileName
                            + ". Capture never updates the approved baseline.");
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot read Atlas product oracle: " + target, exception);
        }
    }

    static void information(String fileName, Collection<String> records) {
        String actual = normalized(records);
        write(INFORMATION_DIRECTORY.resolve(fileName), actual);
        if ("compare".equals(MODE)) {
            verifyInformationDigest(fileName, actual);
        }
    }

    private static void verifyInformationDigest(String fileName, String actual) {
        Path digestFile = ORACLE_DIRECTORY.resolve("../atlas-baseline-info/" + fileName + ".sha256").normalize();
        try {
            if (Files.notExists(digestFile)) {
                fail("Missing approved Atlas information digest: " + digestFile);
            }
            String expected = Files.readString(digestFile, StandardCharsets.UTF_8).trim();
            String actualDigest = sha256(actual);
            if (!expected.equals(actualDigest)) {
                requireInformationChangeApproval(fileName, expected, actualDigest);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot read Atlas information digest: " + digestFile, exception);
        }
    }

    private static void requireInformationChangeApproval(String fileName, String expected, String actual) {
        String owner = System.getProperty("atlas.info.change-owner");
        String reason = System.getProperty("atlas.info.change-reason");
        if (owner == null || owner.isBlank() || reason == null || reason.isBlank()) {
            fail("Atlas information drift in " + fileName + " (expected " + expected + ", actual " + actual
                    + "). Re-run only with explicit atlasInfoChangeOwner and atlasInfoChangeReason evidence.");
        }
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static String normalized(Collection<String> records) {
        List<String> normalized = records.stream()
                .filter(record -> record != null && !record.isBlank())
                .distinct()
                .sorted()
                .toList();
        return String.join("\n", normalized) + "\n";
    }

    private static void write(Path target, String content) {
        try {
            Files.createDirectories(target.getParent());
            Files.writeString(target, content, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot write Atlas baseline evidence: " + target, exception);
        }
    }

    private static String requiredProperty(String name) {
        String value = System.getProperty(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required system property: " + name);
        }
        return value;
    }
}
