package com.room.backend.api.directions.dto.response;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TmapPedestrianResponseDTO {

    private List<Feature> features;

    @Getter
    @NoArgsConstructor
    public static class Feature {
        private Geometry geometry;
        private Properties properties;
    }

    @Getter
    @NoArgsConstructor
    public static class Geometry {
        private String type;
        private JsonNode coordinates;
    }

    @Getter
    @NoArgsConstructor
    public static class Properties {
        private String pointType;
        private int totalTime;
        private int totalDistance;
    }
}
