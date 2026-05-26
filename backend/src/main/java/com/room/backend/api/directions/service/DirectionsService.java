package com.room.backend.api.directions.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.room.backend.api.directions.dto.response.WalkingDirectionsResponseDTO;

import lombok.Getter;

@Service
public class DirectionsService {

    private static final String NCP_DIRECTIONS_URL =
            "https://naveropenapi.apigw.ntruss.com/map-direction/v1/walking";

    private final RestClient restClient;
    private final String clientId;
    private final String clientSecret;

    public DirectionsService(
            RestClient restClient,
            @Value("${naver.geocoding.client-id}") String clientId,
            @Value("${naver.geocoding.client-secret}") String clientSecret
    ) {
        this.restClient = restClient;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    public WalkingDirectionsResponseDTO getWalkingDirections(
            double startLat, double startLng,
            double goalLat, double goalLng
    ) {
        String start = startLng + "," + startLat;
        String goal = goalLng + "," + goalLat;

        NcpDirectionsResponse response = restClient.get()
                .uri(NCP_DIRECTIONS_URL + "?start={start}&goal={goal}", start, goal)
                .header("x-ncp-apigw-api-key-id", clientId)
                .header("x-ncp-apigw-api-key", clientSecret)
                .retrieve()
                .body(NcpDirectionsResponse.class);

        if (response == null || response.getRoute() == null) {
            return null;
        }

        List<NcpDirectionsResponse.Route> routes = response.getRoute().get("traoptimal");
        if (routes == null || routes.isEmpty()) {
            return null;
        }

        NcpDirectionsResponse.Route optimal = routes.get(0);
        int distance = optimal.getSummary().getDistance();
        long duration = optimal.getSummary().getDuration();
        List<double[]> path = optimal.getPath();

        return new WalkingDirectionsResponseDTO(distance, duration, path);
    }

    // NCP Directions API 응답 내부 DTO
    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class NcpDirectionsResponse {
        private Map<String, List<Route>> route;

        @Getter
        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Route {
            private Summary summary;
            private List<double[]> path;

            @Getter
            @JsonIgnoreProperties(ignoreUnknown = true)
            static class Summary {
                private int distance;
                private long duration;
            }
        }
    }
}
