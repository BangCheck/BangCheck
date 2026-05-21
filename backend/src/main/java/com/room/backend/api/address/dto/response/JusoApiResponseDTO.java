package com.room.backend.api.address.dto.response;

import java.util.List;
import lombok.Getter;

@Getter
public class JusoApiResponseDTO {
    private Results results;
    
    @Getter 
    public static class Results{
        private List<Juso> juso;
    }

    @Getter
    public static class Juso{
        private String roadAddr;
        private String jibunAddr;
        private String zipNo;
    }
}
