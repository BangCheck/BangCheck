package com.room.backend.feature.roomregistration.adapter.transaction;

import com.room.backend.feature.roomregistration.application.port.TransactionBoundary;

import org.springframework.transaction.support.TransactionTemplate;

import java.util.function.Supplier;

/**
 * {@link TransactionTemplate} 기반 트랜잭션 경계 adapter.
 *
 * <p>[계약 보존] {@code TransactionTemplate}의 기본값은 legacy {@code @Transactional}과 같다 —
 * propagation {@code REQUIRED}, unchecked exception에서 롤백. 따라서 도메인 거절, 검증 실패,
 * DB 제약 위반 모두 legacy와 동일한 범위로 롤백된다.
 */
public final class SpringTransactionBoundary implements TransactionBoundary {

    private final TransactionTemplate transactionTemplate;

    public SpringTransactionBoundary(TransactionTemplate transactionTemplate) {
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public <T> T execute(Supplier<T> work) {
        return transactionTemplate.execute(status -> work.get());
    }
}
