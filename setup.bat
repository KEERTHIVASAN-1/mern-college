@echo off
REM College Q&A Dashboard Setup Script for Windows
REM This script sets up the development environment for the College Q&A Dashboard

echo 🚀 Setting up College Q&A Dashboard...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install API dependencies
echo 📦 Installing API dependencies...
cd api
npm install
cd ..

REM Install Client dependencies
echo 📦 Installing Client dependencies...
cd client
npm install
cd ..

REM Create environment file for API
if not exist "api\.env" (
    echo 📝 Creating API environment file...
    copy "api\env.example" "api\.env"
    echo ⚠️  Please update api\.env with your MongoDB URI and Google OAuth credentials
) else (
    echo ✅ API environment file already exists
)

REM Create environment file for Client
if not exist "client\.env" (
    echo 📝 Creating Client environment file...
    echo REACT_APP_API_URL=http://localhost:5000 > client\.env
) else (
    echo ✅ Client environment file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update api\.env with your MongoDB URI and Google OAuth credentials
echo 2. Set up Google OAuth credentials:
echo    - Go to https://console.developers.google.com/
echo    - Create a new project or select existing one
echo    - Enable Google+ API
echo    - Create OAuth 2.0 credentials
echo    - Add http://localhost:5000/api/auth/google/callback as redirect URI
echo 3. Start MongoDB (if running locally)
echo 4. Run 'npm run dev' to start both frontend and backend
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 📚 Documentation: See README.md for detailed instructions
pause
