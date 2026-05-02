package com.room.backend.global.map;

import java.math.BigDecimal;

public class DistanceUtil {

    private DistanceUtil() {}

    public static double calculateDistanceM(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        final double R = 6_371_000; // 지구 반지름
        
        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double deltaLat = Math.toRadians(lat2.subtract(lat1).doubleValue());
        double deltaLon = Math.toRadians(lon2.subtract(lon1).doubleValue());

        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
            + Math.cos(lat1Rad) * Math.cos(lat2Rad)
            * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    public static int estimateWalkMinutes(double distanceM) {
        return (int) Math.ceil(distanceM / 67.0); 
    }
    
}
