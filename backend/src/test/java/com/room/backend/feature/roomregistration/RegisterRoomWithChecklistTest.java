package com.room.backend.feature.roomregistration;

import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.feature.roomregistration.application.RegisterRoomCommand;
import com.room.backend.feature.roomregistration.application.RegisterRoomWithChecklist;
import com.room.backend.feature.roomregistration.application.RegisteredRoom;
import com.room.backend.feature.roomregistration.application.port.AddressCoordinateLookup;
import com.room.backend.feature.roomregistration.application.port.ChecklistAnswerStore;
import com.room.backend.feature.roomregistration.application.port.RoomStore;
import com.room.backend.feature.roomregistration.application.port.TransactionBoundary;
import com.room.backend.feature.roomregistration.domain.ChecklistAnswer;
import com.room.backend.feature.roomregistration.domain.Coordinates;
import com.room.backend.feature.roomregistration.domain.RoomRegistration;
import com.room.backend.feature.roomregistration.domain.RoomRegistrationRejected;
import com.room.backend.feature.roomregistration.domain.RoomRegistrationRule;
import com.room.backend.global.common.exception.RoomErrorCode;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * legacy {@code RoomService.createRoomWithCheckAnswers} 동작의 characterization.
 *
 * <p>이 test는 새 구조가 옳은지가 아니라 <b>기존과 같은지</b>를 검사한다. 현재 결함으로 보이는
 * 동작도 그대로 고정하며, 처분은 별도 이슈가 소유한다.
 */
class RegisterRoomWithChecklistTest {

    private final FakeRoomStore rooms = new FakeRoomStore();
    private final FakeChecklistAnswerStore answers = new FakeChecklistAnswerStore();
    private final FakeAddressCoordinateLookup coordinates = new FakeAddressCoordinateLookup();
    private final RegisterRoomWithChecklist useCase =
            new RegisterRoomWithChecklist(new DirectTransactionBoundary(), rooms, answers, coordinates);

    @Test
    void savesRoomAndAnswersInOneTransaction() {
        coordinates.result = Optional.of(new Coordinates(new BigDecimal("37.5"), new BigDecimal("127.0")));

        RegisteredRoom result = useCase.handle(command()
                .rentType(RentType.MONTHLY)
                .monthlyRent(50)
                .answers(List.of(new ChecklistAnswer(7L, "메모", null, List.of(11L, 12L))))
                .build());

        assertEquals(1L, result.id());
        assertEquals(new BigDecimal("37.5"), result.latitude());
        assertEquals(new BigDecimal("127.0"), result.longitude());
        assertEquals(1, rooms.saved.size());
        assertEquals(1, answers.savedFor.size());
        assertEquals(1L, answers.savedRoomId);
    }

    @Test
    void skipsAnswerStoreWhenNoAnswers() {
        useCase.handle(command().rentType(RentType.MONTHLY).monthlyRent(50).build());

        assertEquals(1, rooms.saved.size());
        assertTrue(answers.savedFor.isEmpty());
    }

    @Test
    void rejectsWhenActiveRoomLimitReached() {
        rooms.activeCount = RoomRegistration.MAX_ACTIVE_ROOMS;

        RoomRegistrationRejected rejected = assertThrows(RoomRegistrationRejected.class,
                () -> useCase.handle(command().rentType(RentType.MONTHLY).monthlyRent(50).build()));

        assertEquals(RoomRegistrationRule.ACTIVE_ROOM_LIMIT_EXCEEDED, rejected.rule());
        assertTrue(rooms.saved.isEmpty());
    }

    @Test
    void limitCheckRunsBeforeRentValidationAndBeforeGeocoding() {
        rooms.activeCount = RoomRegistration.MAX_ACTIVE_ROOMS;

        // 상한 초과 + 전세 보증금 누락을 동시에 위반해도 legacy는 상한 오류를 낸다.
        RoomRegistrationRejected rejected = assertThrows(RoomRegistrationRejected.class,
                () -> useCase.handle(command().rentType(RentType.JEONSE).build()));

        assertEquals(RoomRegistrationRule.ACTIVE_ROOM_LIMIT_EXCEEDED, rejected.rule());
        assertFalse(coordinates.called);
    }

    @Test
    void rejectsJeonseWithoutDeposit() {
        RoomRegistrationRejected rejected = assertThrows(RoomRegistrationRejected.class,
                () -> useCase.handle(command().rentType(RentType.JEONSE).build()));

        assertEquals(RoomRegistrationRule.JEONSE_DEPOSIT_REQUIRED, rejected.rule());
    }

    @Test
    void jeonseDiscardsMonthlyRent() {
        RegisteredRoom result = useCase.handle(command()
                .rentType(RentType.JEONSE)
                .deposit(100_000_000L)
                .monthlyRent(50)
                .build());

        assertEquals(100_000_000L, result.deposit());
        assertNull(result.monthlyRent());
    }

    @Test
    void rejectsMonthlyWithoutRent() {
        RoomRegistrationRejected rejected = assertThrows(RoomRegistrationRejected.class,
                () -> useCase.handle(command().rentType(RentType.MONTHLY).build()));

        assertEquals(RoomRegistrationRule.MONTHLY_RENT_REQUIRED, rejected.rule());
    }

    @Test
    void rejectsDeclaredLoanWithoutAmount() {
        RoomRegistrationRejected rejected = assertThrows(RoomRegistrationRejected.class,
                () -> useCase.handle(command()
                        .rentType(RentType.MONTHLY)
                        .monthlyRent(50)
                        .hasLoan(Boolean.TRUE)
                        .build()));

        assertEquals(RoomRegistrationRule.LOAN_AMOUNT_REQUIRED, rejected.rule());
    }

    @Test
    void undeclaredLoanDiscardsAmountButKeepsTheRawFlag() {
        RegisteredRoom withFalse = useCase.handle(command()
                .rentType(RentType.MONTHLY).monthlyRent(50)
                .hasLoan(Boolean.FALSE).loanAmount(9_000L).build());
        assertEquals(Boolean.FALSE, withFalse.hasLoan());
        assertNull(withFalse.loanAmount());

        // legacy는 미신고(null)와 "없음"(false)을 구분해 저장한다.
        RegisteredRoom withNull = useCase.handle(command()
                .rentType(RentType.MONTHLY).monthlyRent(50)
                .hasLoan(null).loanAmount(9_000L).build());
        assertNull(withNull.hasLoan());
        assertNull(withNull.loanAmount());
    }

    @Test
    void unknownManagementFeeDiscardsAmount() {
        RegisteredRoom result = useCase.handle(command()
                .rentType(RentType.MONTHLY).monthlyRent(50)
                .managementFeeUnknown(Boolean.TRUE).managementFee(70_000).build());

        assertEquals(Boolean.TRUE, result.managementFeeUnknown());
        assertNull(result.managementFee());
    }

    @Test
    void knownManagementFeeIsKept() {
        RegisteredRoom result = useCase.handle(command()
                .rentType(RentType.MONTHLY).monthlyRent(50)
                .managementFee(70_000).build());

        assertEquals(Boolean.FALSE, result.managementFeeUnknown());
        assertEquals(70_000, result.managementFee());
    }

    @Test
    void missingCoordinatesAreNotAnError() {
        coordinates.result = Optional.empty();

        RegisteredRoom result = useCase.handle(command().rentType(RentType.MONTHLY).monthlyRent(50).build());

        assertNull(result.latitude());
        assertNull(result.longitude());
        assertEquals(1, rooms.saved.size());
    }

    /**
     * [현행 gap 보존] {@code rentType}이 null이거나 SHORT_TERM이면 legacy는 보증금·월세를 전혀
     * 검증하지 않는다. 결함으로 보이지만 이 리팩토링에서 고치지 않는다.
     */
    @Test
    void unspecifiedRentTypeSkipsAllRentValidation() {
        RegisteredRoom withNull = useCase.handle(command().rentType(null).build());
        assertNull(withNull.rentType());
        assertNull(withNull.deposit());
        assertNull(withNull.monthlyRent());

        RegisteredRoom shortTerm = useCase.handle(command().rentType(RentType.SHORT_TERM).build());
        assertEquals(RentType.SHORT_TERM, shortTerm.rentType());
    }

    /**
     * [계약 보존] null option ID는 여기서 막지 않고 DB 제약까지 내려보낸다. 방어 복사가 NPE를
     * 던지면 legacy의 HTTP 409가 HTTP 500으로 바뀐다.
     */
    @Test
    void nullOptionIdReachesTheStoreInsteadOfThrowing() {
        List<Long> optionIds = new ArrayList<>();
        optionIds.add(null);

        useCase.handle(command()
                .rentType(RentType.MONTHLY).monthlyRent(50)
                .answers(List.of(new ChecklistAnswer(7L, null, null, optionIds)))
                .build());

        assertEquals(Collections.singletonList(null), answers.savedFor.get(0).selectedOptionIds());
    }

    // --- fakes -------------------------------------------------------------

    private static final class DirectTransactionBoundary implements TransactionBoundary {
        @Override
        public <T> T execute(Supplier<T> work) {
            return work.get();
        }
    }

    private static final class FakeRoomStore implements RoomStore {
        private final List<RoomRegistration> saved = new ArrayList<>();
        private int activeCount;

        @Override
        public int countActiveRoomsOf(long ownerId) {
            return activeCount;
        }

        @Override
        public StoredRoom save(RoomRegistration registration) {
            saved.add(registration);
            return new StoredRoom(saved.size(), LocalDateTime.of(2026, 7, 31, 12, 0));
        }
    }

    private static final class FakeChecklistAnswerStore implements ChecklistAnswerStore {
        private final List<ChecklistAnswer> savedFor = new ArrayList<>();
        private long savedRoomId;

        @Override
        public void saveAll(long roomId, List<ChecklistAnswer> answers) {
            savedRoomId = roomId;
            savedFor.addAll(answers);
        }
    }

    private static final class FakeAddressCoordinateLookup implements AddressCoordinateLookup {
        private Optional<Coordinates> result = Optional.empty();
        private boolean called;

        @Override
        public Optional<Coordinates> findFor(String address) {
            called = true;
            return result;
        }
    }

    // --- command builder ---------------------------------------------------

    private static CommandBuilder command() {
        return new CommandBuilder();
    }

    private static final class CommandBuilder {
        private RentType rentType;
        private Long deposit;
        private Integer monthlyRent;
        private Boolean managementFeeUnknown;
        private Integer managementFee;
        private Boolean hasLoan;
        private Long loanAmount;
        private List<ChecklistAnswer> answers = List.of();

        CommandBuilder rentType(RentType value) {
            this.rentType = value;
            return this;
        }

        CommandBuilder deposit(Long value) {
            this.deposit = value;
            return this;
        }

        CommandBuilder monthlyRent(Integer value) {
            this.monthlyRent = value;
            return this;
        }

        CommandBuilder managementFeeUnknown(Boolean value) {
            this.managementFeeUnknown = value;
            return this;
        }

        CommandBuilder managementFee(Integer value) {
            this.managementFee = value;
            return this;
        }

        CommandBuilder hasLoan(Boolean value) {
            this.hasLoan = value;
            return this;
        }

        CommandBuilder loanAmount(Long value) {
            this.loanAmount = value;
            return this;
        }

        CommandBuilder answers(List<ChecklistAnswer> value) {
            this.answers = value;
            return this;
        }

        RegisterRoomCommand build() {
            return new RegisterRoomCommand(
                    42L, "테스트 방", "서울시 어딘가", rentType, deposit, monthlyRent,
                    managementFeeUnknown, managementFee, hasLoan, loanAmount,
                    null, null, null, null, null, null, null, null, null, null, answers);
        }
    }
}
