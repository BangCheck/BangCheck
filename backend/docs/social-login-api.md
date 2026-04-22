# Social Login API Guide

## Base Path
- `/api/v1/auth`

## Supported Providers
- `naver`
- `google`

## 1) Build OAuth Authorize URL
- Method: `GET`
- Path: `/api/v1/auth/oauth2/{provider}`

### Example
```bash
curl -i "http://localhost:8080/api/v1/auth/oauth2/naver"
```

### Success Response (200)
```json
{
  "success": true,
  "code": "OK",
  "message": "Request completed successfully.",
  "data": {
    "url": "https://...",
    "createdAt": "2026-04-16T10:00:00"
  }
}
```

## 2) OAuth Callback (Login / Auto Sign-up)
- Method: `GET`
- Path: `/api/v1/auth/oauth2/{provider}/callback`
- Query Params:
  - `code` (required)
  - `state` (required)

### Example
```bash
curl -i "http://localhost:8080/api/v1/auth/oauth2/google/callback?code=AUTH_CODE&state=STATE_VALUE"
```

### Success Headers
- `Authorization: Bearer {accessToken}`
- `Set-Cookie: refresh_token={refreshToken}; HttpOnly; Secure; SameSite=None; Path=/`

### Success Body (200)
```json
{
  "success": true,
  "code": "OK",
  "message": "Request completed successfully.",
  "data": {
    "resultType": "REGISTERED",
    "createdAt": "2026-04-16T10:01:00"
  }
}
```

## 3) Refresh JWT
- Method: `POST`
- Path: `/api/v1/auth/jwt/refresh`
- Cookie: `refresh_token` required

### Example
```bash
curl -i -X POST "http://localhost:8080/api/v1/auth/jwt/refresh" \
  -H "Cookie: refresh_token=YOUR_REFRESH_TOKEN"
```

### Success Headers
- `Authorization: Bearer {newAccessToken}`
- `Set-Cookie: refresh_token={newRefreshToken}; HttpOnly; Secure; SameSite=None; Path=/`

### Success Body (200)
```json
{
  "success": true,
  "code": "OK",
  "message": "Request completed successfully.",
  "data": null
}
```

## 4) Logout
- Method: `POST`
- Path: `/api/v1/auth/logout`
- Header: `Authorization: Bearer {accessToken}` required

### Example
```bash
curl -i -X POST "http://localhost:8080/api/v1/auth/logout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Success Headers
- `Set-Cookie: refresh_token=; Max-Age=0; HttpOnly; Secure; SameSite=None; Path=/`

### Success Body (200)
```json
{
  "success": true,
  "code": "OK",
  "message": "Request completed successfully.",
  "data": null
}
```

## Common Error Codes
- `AUTH_40001`: invalid provider
- `AUTH_40002`: invalid or expired OAuth state
- `AUTH_40004`: missing refresh token
- `AUTH_40101`: unauthorized
- `AUTH_40104`: invalid refresh token
- `AUTH_40105`: refresh token mismatch
- `AUTH_40401`: user not found
- `AUTH_50201`: oauth token request failed
- `AUTH_50202`: oauth user info request failed
