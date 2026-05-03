package com.room.backend.api.report.service;

import com.room.backend.api.report.dto.response.ReportInfoResponseDTO;
import com.room.backend.api.report.dto.response.RoomSummaryDTO;
import com.room.backend.domain.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {
    private final RoomRepository roomRepository;

    public ReportInfoResponseDTO getRoomsForCompare(Long userId) {

        List<RoomSummaryDTO> result = roomRepository.findByUserId(userId)
                .stream()
                .map(RoomSummaryDTO::from)
                .toList();

        return ReportInfoResponseDTO.builder()
                .rooms(result)
                .build();
    }
}
