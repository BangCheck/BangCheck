package com.room.backend.feature.roomregistration.domain;

import java.util.List;
import java.util.Optional;

/**
 * 등록되려는 방 하나. 상태는 전부 private이고 생성 시점에 불변식이 확정된다.
 *
 * <p>JPA·Spring·HTTP 타입을 참조하지 않는다. 영속화는 port 뒤의 adapter가 담당한다.
 */
public final class RoomRegistration {

    /** legacy {@code RoomService}가 하드코딩하던 활성 방 상한. */
    public static final int MAX_ACTIVE_ROOMS = 6;

    private final long ownerId;
    private final String name;
    private final String address;
    private final Coordinates coordinates;
    private final RentTerms rentTerms;
    private final MaintenanceCost maintenanceCost;
    private final LoanBurden loanBurden;
    private final BuildingProfile building;
    private final MoveInTerms moveIn;
    private final String memo;
    private final List<ChecklistAnswer> answers;

    private RoomRegistration(
            long ownerId,
            String name,
            String address,
            Coordinates coordinates,
            RentTerms rentTerms,
            MaintenanceCost maintenanceCost,
            LoanBurden loanBurden,
            BuildingProfile building,
            MoveInTerms moveIn,
            String memo,
            List<ChecklistAnswer> answers) {
        this.ownerId = ownerId;
        this.name = name;
        this.address = address;
        this.coordinates = coordinates;
        this.rentTerms = rentTerms;
        this.maintenanceCost = maintenanceCost;
        this.loanBurden = loanBurden;
        this.building = building;
        this.moveIn = moveIn;
        this.memo = memo;
        this.answers = answers;
    }

    /**
     * 활성 방 상한을 검사한다. legacy는 이 검사를 geocoding과 임대조건 검증보다 먼저 수행하므로
     * 두 조건을 동시에 위반한 요청은 상한 오류로 응답한다. 그 순서를 보존해야 한다.
     */
    public static void requireCapacityFor(int activeRoomCount) {
        if (activeRoomCount >= MAX_ACTIVE_ROOMS) {
            throw new RoomRegistrationRejected(RoomRegistrationRule.ACTIVE_ROOM_LIMIT_EXCEEDED);
        }
    }

    public static RoomRegistration of(
            long ownerId,
            String name,
            String address,
            Coordinates coordinates,
            RentTerms rentTerms,
            MaintenanceCost maintenanceCost,
            LoanBurden loanBurden,
            BuildingProfile building,
            MoveInTerms moveIn,
            String memo,
            List<ChecklistAnswer> answers) {
        return new RoomRegistration(
                ownerId,
                name,
                address,
                coordinates,
                rentTerms,
                maintenanceCost,
                loanBurden,
                building == null ? BuildingProfile.empty() : building,
                moveIn == null ? MoveInTerms.empty() : moveIn,
                memo,
                answers == null ? List.of() : List.copyOf(answers));
    }

    public long ownerId() {
        return ownerId;
    }

    public String name() {
        return name;
    }

    public String address() {
        return address;
    }

    /** 좌표는 geocoding이 실패하거나 결과가 없으면 비어 있다. legacy도 오류로 만들지 않는다. */
    public Optional<Coordinates> coordinates() {
        return Optional.ofNullable(coordinates);
    }

    public RentTerms rentTerms() {
        return rentTerms;
    }

    public MaintenanceCost maintenanceCost() {
        return maintenanceCost;
    }

    public LoanBurden loanBurden() {
        return loanBurden;
    }

    public BuildingProfile building() {
        return building;
    }

    public MoveInTerms moveIn() {
        return moveIn;
    }

    public String memo() {
        return memo;
    }

    public List<ChecklistAnswer> answers() {
        return answers;
    }

    public boolean hasAnswers() {
        return !answers.isEmpty();
    }
}
