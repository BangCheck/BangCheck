export interface WalkingDirectionsResult {
  distance: number;  // meters
  duration: number;  // seconds (BE TMAP 응답 그대로 — 보행자 totalTime 초 단위)
  path: [number, number][];  // [[lng, lat], ...]
}

export interface WalkingDirectionsResponse {
  success: boolean;
  data: WalkingDirectionsResult | null;
}

export interface WalkingDirectionsParams {
  startLat: number;
  startLng: number;
  goalLat: number;
  goalLng: number;
}
