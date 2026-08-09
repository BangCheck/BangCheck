package com.room.backend.domain.checklist.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("CustomItemCreateRequest 검증 (BC-CHK-04)")
class CustomItemCreateRequestTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void setUp() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void tearDown() {
        factory.close();
    }

    @Test
    @DisplayName("itemName이 null이면 @NotBlank가 위반된다")
    void testItemNameNullFails() {
        CustomItemCreateRequest request = new CustomItemCreateRequest();

        Set<ConstraintViolation<CustomItemCreateRequest>> violations = validator.validate(request);

        assertEquals(1, violations.size());
        assertEquals("itemName", violations.iterator().next().getPropertyPath().toString());
    }

    @Test
    @DisplayName("itemName이 공백만 있으면 @NotBlank가 위반된다")
    void testItemNameBlankFails() throws Exception {
        CustomItemCreateRequest request = newRequestWith("   ");

        Set<ConstraintViolation<CustomItemCreateRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
    }

    @Test
    @DisplayName("itemName이 100자 초과면 @Size가 위반된다")
    void testItemNameTooLongFails() throws Exception {
        String tooLong = "가".repeat(101);
        CustomItemCreateRequest request = newRequestWith(tooLong);

        Set<ConstraintViolation<CustomItemCreateRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("100")));
    }

    @Test
    @DisplayName("정상 이름은 통과한다")
    void testItemNameOk() throws Exception {
        CustomItemCreateRequest request = newRequestWith("베란다 크기");

        Set<ConstraintViolation<CustomItemCreateRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    private CustomItemCreateRequest newRequestWith(String name) throws Exception {
        CustomItemCreateRequest r = new CustomItemCreateRequest();
        Field f = CustomItemCreateRequest.class.getDeclaredField("itemName");
        f.setAccessible(true);
        f.set(r, name);
        return r;
    }
}
