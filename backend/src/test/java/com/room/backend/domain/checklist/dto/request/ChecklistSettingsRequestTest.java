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
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("ChecklistSettingsRequest 검증 (BC-CHK-02)")
class ChecklistSettingsRequestTest {

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
    @DisplayName("disabledItemIds 필드가 null이면 @NotNull이 위반된다")
    void testDisabledItemIdsNullFails() throws Exception {
        ChecklistSettingsRequest request = new ChecklistSettingsRequest();

        Set<ConstraintViolation<ChecklistSettingsRequest>> violations = validator.validate(request);

        assertEquals(1, violations.size());
        ConstraintViolation<ChecklistSettingsRequest> v = violations.iterator().next();
        assertEquals("disabledItemIds", v.getPropertyPath().toString());
        assertTrue(v.getMessage().contains("disabledItemIds"));
    }

    @Test
    @DisplayName("빈 배열은 통과한다 — 비활성 항목이 없다는 뜻")
    void testDisabledItemIdsEmptyOk() throws Exception {
        ChecklistSettingsRequest request = newRequestWith(List.of());

        Set<ConstraintViolation<ChecklistSettingsRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("값이 있는 배열은 통과한다")
    void testDisabledItemIdsNonEmptyOk() throws Exception {
        ChecklistSettingsRequest request = newRequestWith(List.of(1L, 2L));

        Set<ConstraintViolation<ChecklistSettingsRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    private ChecklistSettingsRequest newRequestWith(List<Long> ids) throws Exception {
        ChecklistSettingsRequest r = new ChecklistSettingsRequest();
        Field f = ChecklistSettingsRequest.class.getDeclaredField("disabledItemIds");
        f.setAccessible(true);
        f.set(r, ids);
        return r;
    }
}
