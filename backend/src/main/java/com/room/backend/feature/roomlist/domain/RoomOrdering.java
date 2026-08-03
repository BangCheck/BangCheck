package com.room.backend.feature.roomlist.domain;

import com.room.backend.domain.room.entity.enums.RoomSortType;

import java.util.Comparator;
import java.util.List;

/**
 * 목록 정렬 정책.
 *
 * <p>[계약 보존] legacy {@code RoomService.getRooms}의 동작을 그대로 옮겼다.
 * <ul>
 *   <li>정렬 미지정이면 조회 순서(생성 최신순)를 유지한다.</li>
 *   <li>값이 null인 방은 각 정렬에서 <b>맨 뒤</b>로 간다. legacy가 null을 타입 최대값으로
 *       치환하기 때문이다.</li>
 *   <li>{@code Stream.sorted}는 안정 정렬이므로 동점은 생성 최신순을 유지한다.</li>
 * </ul>
 */
public final class RoomOrdering {

    private RoomOrdering() {
    }

    public static List<ListedRoom> apply(List<ListedRoom> rooms, RoomSortType sortType) {
        if (sortType == null) {
            return rooms;
        }
        return rooms.stream().sorted(comparatorFor(sortType)).toList();
    }

    private static Comparator<ListedRoom> comparatorFor(RoomSortType sortType) {
        switch (sortType) {
            case DEPOSIT_ASC:
                return Comparator.comparingLong(
                        room -> room.deposit() == null ? Long.MAX_VALUE : room.deposit());
            case RENT_ASC:
                return Comparator.comparingInt(
                        room -> room.monthlyRent() == null ? Integer.MAX_VALUE : room.monthlyRent());
            case MANAGEMENT_FEE_ASC:
                return Comparator.comparingInt(
                        room -> room.managementFee() == null ? Integer.MAX_VALUE : room.managementFee());
            default:
                throw new IllegalStateException("Unmapped room sort type: " + sortType);
        }
    }
}
