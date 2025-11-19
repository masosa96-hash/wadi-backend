# Service URL Detection and Health Validation

## Overview

This design defines an automated system to detect the public URL of the Railway-deployed backend service (wadi-backend), display it to the console, and validate that the /health endpoint responds correctly.

## Objectives

1. Automatically detect the Railway public service URL
2. Display the detected URL to the console
3. Validate the /health endpoint responds with a successful status
4. Provide clear feedback on validation results

## Context

- The backend service is deployed on Railway platform
- The service exposes a /health endpoint that returns JSON with status information
- The health endpoint includes Supabase connection status validation
- Railway automatically provisions a public URL for deployed services

## Functional Requirements

### 1. URL Detection

The system must detect the Railway service URL through one of the following methods:

| Method | Description | Priority |
|--------|-------------|----------|
| Railway CLI | Query Railway CLI for the deployed service URL | High |
| Environment Variable | Read from RAILWAY_STATIC_URL or similar Railway-provided variables | High |
| Configuration File | Read from a local configuration or deployment record | Medium |
| User Input | Prompt user to provide the URL if automatic detection fails | Low |

### 2. Console Output

The system must display:

- The detected Railway service URL
- Timestamp of detection
- Clear formatting for easy readability

Example output format:
```
[2024-01-15 10:30:45] Railway Service URL Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: https://wadi-backend-production.up.railway.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Health Endpoint Validation

The system must:

- Construct the full health endpoint URL by appending /health to the base URL
- Send an HTTP GET request to the endpoint
- Parse the JSON response
- Validate the response structure and status

Expected health endpoint response structure:
```
{
  "status": "ok",
  "supabase": "connected" | "disconnected"
}
```

### 4. Validation Results Display

The system must display validation results including:

| Information | Description |
|-------------|-------------|
| Endpoint URL | Full URL tested (base URL + /health) |
| HTTP Status Code | Response status code (200, 404, 500, etc.) |
| Response Time | Time taken for the request in milliseconds |
| Health Status | Value of "status" field from response |
| Supabase Status | Value of "supabase" field from response |
| Overall Result | PASSED or FAILED with reason |

Example success output:
```
[2024-01-15 10:30:46] Health Endpoint Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Endpoint: https://wadi-backend-production.up.railway.app/health
Status Code: 200 OK
Response Time: 245ms
Health Status: ok
Supabase: connected
Result: ✓ PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Example failure output:
```
[2024-01-15 10:30:46] Health Endpoint Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Endpoint: https://wadi-backend-production.up.railway.app/health
Status Code: 503 Service Unavailable
Response Time: 1203ms
Health Status: ok
Supabase: disconnected
Result: ✗ FAILED - Supabase connection unavailable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Technical Approach

### URL Detection Strategy

The detection process follows this priority sequence:

1. Check for Railway CLI availability and query the service URL
2. Check for Railway-provided environment variables at runtime
3. Fall back to manual URL input if automatic detection fails

### HTTP Request Configuration

| Parameter | Value |
|-----------|-------|
| Method | GET |
| Timeout | 10 seconds |
| Headers | Accept: application/json |
| Follow Redirects | Yes (max 3) |

### Validation Criteria

The health check is considered PASSED when:

- HTTP status code is 200
- Response body is valid JSON
- Response contains "status" field with value "ok"
- Response time is under 5000ms

The health check is considered FAILED when:

- HTTP status code is not 200
- Response is not valid JSON
- "status" field is missing or not "ok"
- Request times out
- Network error occurs

### Error Handling

The system must handle the following error scenarios:

| Error Type | Handling Strategy |
|------------|-------------------|
| URL not detected | Display error message and prompt for manual input |
| Network timeout | Display timeout error with timeout duration |
| Invalid response | Display response parsing error with received content |
| Connection refused | Display connection error and suggest service may be down |
| SSL/TLS errors | Display certificate error and suggest checking deployment |

## Constraints

- The system must not modify any existing files or configurations
- The system must not require external dependencies beyond standard HTTP libraries
- The detection and validation process must complete within 30 seconds
- The system must work on Windows environment (project workspace path)
- No persistent storage or logging to files is required

## Non-Functional Requirements

| Requirement | Description |
|-------------|-------------|
| Performance | Complete detection and validation within 30 seconds |
| Reliability | Handle network failures gracefully |
| Usability | Provide clear, human-readable console output |
| Security | Do not expose sensitive credentials in console output |

## Out of Scope

The following are explicitly out of scope for this design:

- Automated deployment or configuration changes
- Continuous monitoring or repeated health checks
- Notification systems or alerting
- Integration with CI/CD pipelines
- Logging to files or external systems
- Modification of Railway deployment settings
- Database validation beyond the health endpoint response
