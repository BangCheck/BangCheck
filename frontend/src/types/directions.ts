export interface WalkingDirectionsResult {
  distance: number;  // meters
  duration: number;  // milliseconds
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
