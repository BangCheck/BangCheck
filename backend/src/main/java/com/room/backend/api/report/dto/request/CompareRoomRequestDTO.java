package com.room.backend.api.report.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompareRoomRequestDTO {
    private List<Long> roomIds;
    private List<String> categories;
}
