package com.room.backend.baseline;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.mysql.MySQLContainer;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Testcontainers
@SpringBootTest(properties = {
        "spring.jpa.show-sql=false",
        "spring.main.banner-mode=off",
        "jwt.secret-key=atlas-baseline-secret-key-at-least-thirty-two-bytes-long",
        "jwt.access-token-expiration=3600000",
        "jwt.refresh-token-expiration=1209600000",
        "oauth.naver.client-id=atlas",
        "oauth.naver.client-secret=atlas",
        "oauth.naver.redirect-uri=http://localhost/atlas/naver",
        "oauth.google.client-id=atlas",
        "oauth.google.client-secret=atlas",
        "oauth.google.redirect-uri=http://localhost/atlas/google",
        "naver.geocoding.client-id=atlas",
        "naver.geocoding.client-secret=atlas",
        "tmap.api.app-key=atlas",
        "juso.api.confirm-key=atlas"
})
class BackendContextBaselineTest {

    // Verified 2026-08-02. Pin the immutable digest so mysql:8.0 tag movement cannot change the oracle runtime.
    private static final String MYSQL_IMAGE =
            "mysql@sha256:7dcddc01f13bab2f15cde676d44d01f61fc9f99fe7785e86196dfc07d358ae2b";

    @Container
    static final MySQLContainer MYSQL = new MySQLContainer(MYSQL_IMAGE)
            .withDatabaseName("room")
            .withUsername("room")
            .withPassword("room")
            .withReuse(false);

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
    }

    @Autowired
    ApplicationContext applicationContext;

    @Autowired
    RequestMappingHandlerMapping requestMappingHandlerMapping;

    @Autowired
    Flyway flyway;

    @Test
    void comparesProductOraclesAndWritesInformationEvidence() {
        BaselineSnapshot.oracle("routes.txt", routeRecords());
        BaselineSnapshot.oracle("flyway-checksums.txt", migrationRecords());
        BaselineSnapshot.information("bean-names.txt",
                Arrays.asList(applicationContext.getBeanDefinitionNames()));
    }

    private List<String> routeRecords() {
        return requestMappingHandlerMapping.getHandlerMethods().keySet().stream()
                .flatMap(this::routeRecords)
                .toList();
    }

    private Stream<String> routeRecords(RequestMappingInfo mappingInfo) {
        Set<RequestMethod> methods = mappingInfo.getMethodsCondition().getMethods();
        Collection<String> methodNames = methods.isEmpty()
                ? List.of("*")
                : methods.stream().map(Enum::name).toList();

        return mappingInfo.getPatternValues().stream()
                .flatMap(pattern -> methodNames.stream().map(method -> method + " " + pattern));
    }

    private List<String> migrationRecords() {
        return Arrays.stream(flyway.info().applied())
                .map(this::migrationRecord)
                .toList();
    }

    private String migrationRecord(MigrationInfo migration) {
        String version = migration.getVersion() == null ? "repeatable" : migration.getVersion().getVersion();
        String checksum = migration.getChecksum() == null ? "none" : migration.getChecksum().toString();
        return version + "|" + migration.getDescription() + "|" + checksum;
    }
}
