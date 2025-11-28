@echo off
TITLE WADI Deployment Preparation

echo 🚀 WADI - Cloud Deployment Preparation
echo ========================================
echo.

echo 🔍 Checking required deployment files...
echo.

if exist "render.yaml" (
    echo   ✓ render.yaml
) else (
    echo   ✗ render.yaml (MISSING)
)

if exist "apps\frontend\vercel.json" (
    echo   ✓ apps\frontend\vercel.json
) else (
    echo   ✗ apps\frontend\vercel.json (MISSING)
)

if exist "apps\frontend\.env.example" (
    echo   ✓ apps\frontend\.env.example
) else (
    echo   ✗ apps\frontend\.env.example (MISSING)
)

if exist "apps\api\.env.example" (
    echo   ✓ apps\api\.env.example
) else (
    echo   ✗ apps\api\.env.example (MISSING)
)

echo.
echo ✅ Deployment preparation check complete!
echo.
echo Next steps:
echo 1. Ensure all required files exist
echo 2. Run pnpm build:frontend
echo 3. Run pnpm build:api
echo 4. Deploy to Vercel and Render
echo.
echo Refer to COMPLETE_DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause