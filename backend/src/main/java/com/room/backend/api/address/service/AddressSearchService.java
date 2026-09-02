package com.room.backend.api.address.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.room.backend.api.address.dto.response.AddressSearchResponseDTO;
import com.room.backend.api.address.dto.response.JusoApiResponseDTO;
import com.room.backend.global.common.exception.AddressSearchErrorCode;
import com.room.backend.global.common.exception.GeneralException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AddressSearchService {

    private final RestClient restClient;
    private final String confirmKey;

    public AddressSearchService(
            RestClient restClient,
            @Value("${juso.api.confirm-key}") String confirmKey
    ) {
        this.restClient = restClient;
        this.confirmKey = confirmKey;
    }

    public List<AddressSearchResponseDTO> getLegitAddress(String keyword){
        if (keyword == null || keyword.isBlank()) {
            return Collections.emptyList();
        }

        JusoApiResponseDTO response;
        try {
            response = restClient.get()
                .uri("https://business.juso.go.kr/addrlink/addrLinkApi.do?confmKey={key}&currentPage=1&countPerPage=10&keyword={kw}&resultType=json", confirmKey, keyword)
                .retrieve()
                .body(JusoApiResponseDTO.class);
        } catch (RestClientResponseException e) {
            // 업스트림 4xx·5xx 를 502 로 재매핑한다. 이전에는 GlobalExceptionHandler
            // 포괄 분기가 COMMON_500 으로 만들어 사용자가 원인을 알 수 없었다.
            log.warn("juso.go.kr returned {}", e.getStatusCode(), e);
            throw new GeneralException(AddressSearchErrorCode.PROVIDER_ERROR);
        } catch (ResourceAccessException e) {
            // timeout·connection refused 등 I/O 계열은 503 으로 낸다.
            log.warn("juso.go.kr unreachable", e);
            throw new GeneralException(AddressSearchErrorCode.PROVIDER_UNAVAILABLE);
        }

        if (response == null || response.getResults() == null || response.getResults().getCommon() == null) {
            log.warn("juso.go.kr returned a malformed response");
            throw new GeneralException(AddressSearchErrorCode.PROVIDER_ERROR);
        }

        JusoApiResponseDTO.Common common = response.getResults().getCommon();
        if (!"0".equals(common.getErrorCode())) {
            log.warn(
                    "juso.go.kr returned application error {}: {}",
                    common.getErrorCode(),
                    common.getErrorMessage()
            );
            throw new GeneralException(AddressSearchErrorCode.PROVIDER_ERROR);
        }

        if (response.getResults().getJuso() == null) {
            return Collections.emptyList();
        }

        return response.getResults().getJuso().stream()
            .map(j -> new AddressSearchResponseDTO(j.getRoadAddr(), j.getJibunAddr(), j.getZipNo()))
            .toList();
    }
}
