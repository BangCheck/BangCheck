package com.room.backend.api.address.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.room.backend.api.address.dto.response.AddressSearchResponseDTO;
import com.room.backend.api.address.dto.response.JusoApiResponseDTO;

import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class AddressSearchService {

    private final RestClient restClient;
    
    @Value("${juso.api.confirm-key}")
    private String confirmKey;

    public List<AddressSearchResponseDTO> getLegitAddress(String keyword){
        if (keyword == null || keyword.isBlank()) {
            return Collections.emptyList();
        }

        JusoApiResponseDTO response = restClient.get()
            .uri("https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey={key}&currentPage=1&countPerPage=10&keyword={kw}&resultType=json", confirmKey, keyword)
            .retrieve()
            .body(JusoApiResponseDTO.class);

        if (response == null || response.getResults() == null || response.getResults().getJuso() == null) {
            return Collections.emptyList();
        }

        return response.getResults().getJuso().stream()
            .map(j -> new AddressSearchResponseDTO(j.getRoadAddr(), j.getJibunAddr(), j.getZipNo()))
            .toList();
    }
}
