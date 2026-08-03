package com.room.backend.feature.roomregistration.domain;

import com.room.backend.domain.room.entity.enums.RentType;

/**
 * 임대 조건. 변형마다 필수 필드 집합이 다르므로 sealed로 닫는다.
 *
 * <p>legacy {@code Room.create}의 분기를 그대로 옮긴 것이며 동작을 바꾸지 않는다.
 * 특히 {@link Unspecified}는 현행에서 {@code rentType == null}이면 아무 검증도 하지 않는
 * 동작을 보존하기 위해 존재한다. 이 gap의 처분은 별도 Story가 소유한다.
 */
public sealed interface RentTerms {

    /** 전세 — 보증금이 필수이고 월세는 저장하지 않는다. */
    record Jeonse(long deposit) implements RentTerms {
    }

    /** 월세 — 월세액이 필수이고 보증금은 선택이다. */
    record Monthly(Long deposit, int monthlyRent) implements RentTerms {
    }

    /**
     * 검증 규칙이 없는 나머지 — {@code null}과 {@link RentType#SHORT_TERM}이 여기 들어온다.
     * 현행은 이 경우 보증금·월세를 검증 없이 그대로 통과시키므로 원래 유형 값을 보존한다.
     */
    record Unspecified(RentType rentType, Long deposit, Integer monthlyRent) implements RentTerms {
    }

    static RentTerms of(RentType rentType, Long deposit, Integer monthlyRent) {
        if (rentType == RentType.JEONSE) {
            if (deposit == null) {
                throw new RoomRegistrationRejected(RoomRegistrationRule.JEONSE_DEPOSIT_REQUIRED);
            }
            return new Jeonse(deposit);
        }
        if (rentType == RentType.MONTHLY) {
            if (monthlyRent == null) {
                throw new RoomRegistrationRejected(RoomRegistrationRule.MONTHLY_RENT_REQUIRED);
            }
            return new Monthly(deposit, monthlyRent);
        }
        return new Unspecified(rentType, deposit, monthlyRent);
    }

    /** 저장·응답에 쓰이는 임대 유형. 미지정이면 null이 그대로 유지된다. */
    default RentType storedRentType() {
        if (this instanceof Jeonse) {
            return RentType.JEONSE;
        }
        if (this instanceof Monthly) {
            return RentType.MONTHLY;
        }
        return ((Unspecified) this).rentType();
    }

    /** 저장될 보증금. 없으면 null. */
    default Long storedDeposit() {
        if (this instanceof Jeonse jeonse) {
            return jeonse.deposit();
        }
        if (this instanceof Monthly monthly) {
            return monthly.deposit();
        }
        return ((Unspecified) this).deposit();
    }

    /** 저장될 월세. 전세는 항상 null이다. */
    default Integer storedMonthlyRent() {
        if (this instanceof Jeonse) {
            return null;
        }
        if (this instanceof Monthly monthly) {
            return monthly.monthlyRent();
        }
        return ((Unspecified) this).monthlyRent();
    }
}
