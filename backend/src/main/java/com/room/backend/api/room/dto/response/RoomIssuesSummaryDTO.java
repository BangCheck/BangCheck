package com.room.backend.api.room.dto.response;

import lombok.Getter;

@Getter
public class RoomIssuesSummaryDTO {
    private final RoomIssueStatus mold;
    private final RoomIssueStatus leak;
    private final RoomIssueStatus bug;
    private final RoomIssueStatus drainSmell;
    private final RoomIssueStatus condensation;

    public RoomIssuesSummaryDTO(
            RoomIssueStatus mold,
            RoomIssueStatus leak,
            RoomIssueStatus bug,
            RoomIssueStatus drainSmell,
            RoomIssueStatus condensation
    ) {
        this.mold = mold;
        this.leak = leak;
        this.bug = bug;
        this.drainSmell = drainSmell;
        this.condensation = condensation;
    }
    
}
