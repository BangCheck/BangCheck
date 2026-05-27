package com.room.backend.api.directions.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DirectionsResponseDTO {

    private int distance;
    private long duration;
    private List<List<Double>> path;
}
