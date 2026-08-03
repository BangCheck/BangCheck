package com.room.backend.feature.roomregistration.application.port;

import java.util.function.Supplier;

/**
 * 트랜잭션 경계 side-effect port.
 *
 * <p>{@code @Transactional} 애노테이션을 쓰지 않는 이유는 둘이다.
 * <ol>
 *   <li>CGLIB는 {@code final} 클래스를 프록시할 수 없다. use case를 {@code final}로 유지하려면
 *       애노테이션 기반 프록시를 쓸 수 없다.</li>
 *   <li>애노테이션은 트랜잭션 경계를 호출부에서 보이지 않게 만든다. 경계를 코드로 드러낸다.</li>
 * </ol>
 *
 * <p>실패 시 롤백 의미는 adapter 구현이 소유하며 legacy {@code @Transactional}과 동일해야 한다.
 */
public interface TransactionBoundary {

    <T> T execute(Supplier<T> work);
}
