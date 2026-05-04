package com.room.backend.domain.checklist.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "room_check_selected_options")
public class RoomCheckSelectedOption {
    
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(name = "result_id", nullable = false)
    private Long resultId;

    @Column(name = "option_id", nullable = false)
    private Long optionId;

    public static RoomCheckSelectedOption create(Long resultId, Long optionId) {
        
        RoomCheckSelectedOption selectedOption = new RoomCheckSelectedOption();

        selectedOption.resultId = resultId;
        selectedOption.optionId = optionId;

        return selectedOption;
    }
}
