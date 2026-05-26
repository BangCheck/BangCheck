package com.room.backend.api.directions.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WalkingDirectionsResponseDTO {

    private final int distance;        // meters
    private final long duration;       // milliseconds
    private final List<double[]> path; // [[lng, lat], ...]
}
