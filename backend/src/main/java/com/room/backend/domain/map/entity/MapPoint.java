package com.room.backend.domain.map.entity;

import com.room.backend.global.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "map_points")
public class MapPoint extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "lat", nullable = false, precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(name = "lon", nullable = false, precision = 10, scale = 7)
    private BigDecimal lon;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    private MapPoint(Long userId, String name, BigDecimal lat, BigDecimal lon, String address) {
        this.userId = userId;
        this.name = name;
        this.lat = lat;
        this.lon = lon;
        this.address = address;
    }

    public static MapPoint create(Long userId, String name, BigDecimal lat, BigDecimal lon, String address) {
        return new MapPoint(userId, name, lat, lon, address);
    }
}
