-- rooms 테이블에 geocoding 좌표 컬럼 추가
ALTER TABLE rooms
    ADD COLUMN lat DECIMAL(10, 7) NULL,
    ADD COLUMN lon DECIMAL(10, 7) NULL;

-- 기준점 테이블
CREATE TABLE IF NOT EXISTS map_points (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    lat         DECIMAL(10, 7)  NOT NULL,
    lon         DECIMAL(10, 7)  NOT NULL,
    address     VARCHAR(255)    NOT NULL,
    created_at  DATETIME(6)     NOT NULL,
    updated_at  DATETIME(6)     NOT NULL,
    deleted_at  DATETIME(6),
    is_deleted  TINYINT(1)      NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_map_points_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 방-기준점 거리 테이블
CREATE TABLE IF NOT EXISTS room_point_distances (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    room_id          BIGINT      NOT NULL,
    point_id         BIGINT      NOT NULL,
    distance_m       INT         NOT NULL,
    walk_time_min    INT         NOT NULL,
    transit_time_min INT         NOT NULL,
    transit_type     VARCHAR(20) NOT NULL,
    calculated_at    DATETIME(6) NOT NULL,
    created_at       DATETIME(6) NOT NULL,
    updated_at       DATETIME(6) NOT NULL,
    deleted_at       DATETIME(6),
    is_deleted       TINYINT(1)  NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_room_point (room_id, point_id),
    CONSTRAINT fk_rpd_room  FOREIGN KEY (room_id)  REFERENCES rooms(id),
    CONSTRAINT fk_rpd_point FOREIGN KEY (point_id) REFERENCES map_points(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
