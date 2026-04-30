package com.room.backend.map.domain.entity;


import com.room.backend.global.common.entity.BaseEntity;
import com.room.backend.domain.room.entity.Room;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "room_point_distances")
public class RoomPointDistance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_id", nullable = false)
    private MapPoint mapPoint;
    
    @Column(name = "distance_m", nullable = false)
    private int distanceM;

    @Column(name = "walk_time_min", nullable = false)
    private int walkTimeMin;

    @Column(name = "transit_time_min", nullable = false)
    private int transitTimeMin;

    @Column(name = "transit_type", nullable = false, length = 20)
    private String transitType;

    @Column(name = "calculated_at", nullable = false, columnDefinition = "DATETIME(6)")
    private LocalDateTime calculatedAt;



}
