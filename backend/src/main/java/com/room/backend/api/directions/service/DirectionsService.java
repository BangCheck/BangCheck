package com.room.backend.api.directions.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.room.backend.api.directions.dto.response.DirectionsResponseDTO;
import com.room.backend.api.directions.dto.response.TmapPedestrianResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DirectionsService {

    private final RestClient restClient;

    @Value("${tmap.api.app-key}")
    private String tmapAppKey;

    private static final String TMAP_PEDESTRIAN_URL = "https://apis.openapi.sk.com/tmap/routes/pedestrian";

    public DirectionsResponseDTO getWalkingDirections(double startLat, double startLng, double goalLat, double goalLng) {
        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        formBody.add("startX", String.valueOf(startLng));
        formBody.add("startY", String.valueOf(startLat));
        formBody.add("endX", String.valueOf(goalLng));
        formBody.add("endY", String.valueOf(goalLat));
        formBody.add("startName", "출발");
        formBody.add("endName", "도착");
        formBody.add("reqCoordType", "WGS84GEO");
        formBody.add("resCoordType", "WGS84GEO");
        formBody.add("searchOption", "0");

        TmapPedestrianResponseDTO response = restClient.post()
            .uri(TMAP_PEDESTRIAN_URL)
            .header("appKey", tmapAppKey)
            .header("Accept-Language", "ko")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(formBody)
            .retrieve()
            .body(TmapPedestrianResponseDTO.class);

        if (response == null || response.getFeatures() == null || response.getFeatures().isEmpty()) {
            return null;
        }

        int totalTime = 0;
        int totalDistance = 0;
        List<List<Double>> path = new ArrayList<>();

        for (TmapPedestrianResponseDTO.Feature feature : response.getFeatures()) {
            TmapPedestrianResponseDTO.Properties props = feature.getProperties();
            TmapPedestrianResponseDTO.Geometry geometry = feature.getGeometry();

            if ("SP".equals(props.getPointType())) {
                totalTime = props.getTotalTime();
                totalDistance = props.getTotalDistance();
            }

            if ("LineString".equals(geometry.getType())) {
                for (JsonNode point : geometry.getCoordinates()) {
                    List<Double> coord = new ArrayList<>();
                    coord.add(point.get(0).asDouble());
                    coord.add(point.get(1).asDouble());
                    path.add(coord);
                }
            }
        }

        return new DirectionsResponseDTO(totalDistance, totalTime, path);
    }
}
