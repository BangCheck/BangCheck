package com.room.backend.api.room.dto.response;

import lombok.Getter;

@Getter
public class RoomIssuesSummaryDTO {
    private final boolean mold;
    private final boolean leak;
    private final boolean bug;
    private final boolean drainSmell;
    private final boolean condensation;

    public RoomIssuesSummaryDTO(boolean mold, boolean leak, boolean bug, boolean drainSmell, boolean condensation) {
        this.mold = mold;
        this.leak = leak;
        this.bug = bug;
        this.drainSmell = drainSmell;
        this.condensation = condensation;
    }
    
}
