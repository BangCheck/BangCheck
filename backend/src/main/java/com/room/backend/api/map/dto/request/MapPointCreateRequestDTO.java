package com.room.backend.api.map.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MapPointCreateRequestDTO {

    @NotBlank(message = "기준점 이름은 필수입니다.")
    private String name;

    @NotBlank(message = "주소는 필수입니다.")
    private String address;

    @NotNull(message = "위도는 필수입니다.")
    private BigDecimal lat;

    @NotNull(message = "경도는 필수입니다.")
    private BigDecimal lon;
}
