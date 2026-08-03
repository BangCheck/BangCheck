package com.room.backend.feature.roomregistration.application;

import com.room.backend.feature.roomregistration.application.port.AddressCoordinateLookup;
import com.room.backend.feature.roomregistration.application.port.ChecklistAnswerStore;
import com.room.backend.feature.roomregistration.application.port.RoomStore;
import com.room.backend.feature.roomregistration.application.port.TransactionBoundary;
import com.room.backend.feature.roomregistration.domain.BuildingProfile;
import com.room.backend.feature.roomregistration.domain.Coordinates;
import com.room.backend.feature.roomregistration.domain.LoanBurden;
import com.room.backend.feature.roomregistration.domain.MaintenanceCost;
import com.room.backend.feature.roomregistration.domain.MoveInTerms;
import com.room.backend.feature.roomregistration.domain.RentTerms;
import com.room.backend.feature.roomregistration.domain.RoomRegistration;

/**
 * 이관: {@code RoomService.createRoomWithCheckAnswers} → 이 use case.
 *
 * 방 하나와 그 체크리스트 답변을 한 트랜잭션에서 등록한다.
 *
 * <p>legacy {@code RoomService.createRoomWithCheckAnswers}의 동작을 그대로 옮긴 것이며
 * 검증·예외·저장 순서를 바꾸지 않는다.
 */
public final class RegisterRoomWithChecklist {

    private final TransactionBoundary transaction;
    private final RoomStore rooms;
    private final ChecklistAnswerStore checklistAnswers;
    private final AddressCoordinateLookup addressCoordinates;

    public RegisterRoomWithChecklist(
            TransactionBoundary transaction,
            RoomStore rooms,
            ChecklistAnswerStore checklistAnswers,
            AddressCoordinateLookup addressCoordinates) {
        this.transaction = transaction;
        this.rooms = rooms;
        this.checklistAnswers = checklistAnswers;
        this.addressCoordinates = addressCoordinates;
    }

    public RegisteredRoom handle(RegisterRoomCommand command) {
        return transaction.execute(() -> register(command));
    }

    private RegisteredRoom register(RegisterRoomCommand command) {
        // [순서 보존] legacy는 상한 검사 → geocoding → 임대조건 검증 순이다.
        // 상한 초과와 보증금 누락을 동시에 위반한 요청은 상한 오류로 응답해야 한다.
        RoomRegistration.requireCapacityFor(rooms.countActiveRoomsOf(command.ownerId()));

        // [계약 보존] geocoding은 legacy와 동일하게 트랜잭션 안에서 호출되고,
        // 결과가 없어도 오류가 아니라 좌표 없는 방으로 저장된다.
        Coordinates coordinates = addressCoordinates.findFor(command.address()).orElse(null);

        RoomRegistration registration = RoomRegistration.of(
                command.ownerId(),
                command.name(),
                command.address(),
                coordinates,
                RentTerms.of(command.rentType(), command.deposit(), command.monthlyRent()),
                MaintenanceCost.of(command.managementFeeUnknown(), command.managementFee()),
                LoanBurden.of(command.hasLoan(), command.loanAmount()),
                new BuildingProfile(
                        command.buildingType(),
                        command.floor(),
                        command.specialFloor(),
                        command.direction(),
                        command.hasElevator(),
                        command.hasParking()),
                new MoveInTerms(
                        command.moveInDate(),
                        command.moveInDateNegotiable(),
                        command.canRegisterAddress()),
                command.memo(),
                command.answers());

        RoomStore.StoredRoom stored = rooms.save(registration);

        // [계약 보존] legacy는 답변이 비어 있으면 답변 저장 자체를 건너뛴다.
        if (registration.hasAnswers()) {
            checklistAnswers.saveAll(stored.id(), registration.answers());
        }

        return describe(registration, stored);
    }

    private RegisteredRoom describe(RoomRegistration registration, RoomStore.StoredRoom stored) {
        RentTerms rentTerms = registration.rentTerms();
        MaintenanceCost maintenanceCost = registration.maintenanceCost();
        LoanBurden loanBurden = registration.loanBurden();
        BuildingProfile building = registration.building();
        MoveInTerms moveIn = registration.moveIn();

        return new RegisteredRoom(
                stored.id(),
                registration.name(),
                registration.address(),
                registration.coordinates().map(Coordinates::latitude).orElse(null),
                registration.coordinates().map(Coordinates::longitude).orElse(null),
                rentTerms.storedRentType(),
                rentTerms.storedDeposit(),
                rentTerms.storedMonthlyRent(),
                maintenanceCost.storedFee(),
                maintenanceCost.unknownFlag(),
                loanBurden.declared(),
                loanBurden.amount(),
                moveIn.canRegisterAddress(),
                moveIn.availableFrom(),
                moveIn.negotiable(),
                building.buildingType(),
                building.floor(),
                building.hasElevator(),
                building.hasParking(),
                building.specialFloor(),
                building.direction(),
                registration.memo(),
                stored.createdAt());
    }
}
