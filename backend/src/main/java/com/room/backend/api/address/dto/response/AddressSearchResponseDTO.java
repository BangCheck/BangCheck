package com.room.backend.api.address.dto.response;

import lombok.Getter;


@Getter
public class AddressSearchResponseDTO {
    private final String roadAddr;
    private final String jibunAddr;
    private final String zipNo;

    public AddressSearchResponseDTO(String roadAddr, String jibunAddr, String zipNo){
        this.roadAddr = roadAddr;
        this.jibunAddr = jibunAddr;
        this.zipNo = zipNo;
    }

}
