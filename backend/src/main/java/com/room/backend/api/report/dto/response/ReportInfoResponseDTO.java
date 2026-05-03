package com.room.backend.api.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ReportInfoResponseDTO {
    private List<RoomSummaryDTO> rooms;
}
