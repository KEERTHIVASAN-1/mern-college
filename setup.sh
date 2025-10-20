#!/bin/bash

# College Q&A Dashboard Setup Script
# This script sets up the development environment for the College Q&A Dashboard

echo "🚀 Setting up College Q&A Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api
npm install
cd ..

# Install Client dependencies
echo "📦 Installing Client dependencies..."
cd client
npm install
cd ..

# Create environment file for API
if [ ! -f "api/.env" ]; then
    echo "📝 Creating API environment file..."
    cp api/env.example api/.env
    echo "⚠️  Please update api/.env with your MongoDB URI and Google OAuth credentials"
else
    echo "✅ API environment file already exists"
fi

# Create environment file for Client
if [ ! -f "client/.env" ]; then
    echo "📝 Creating Client environment file..."
    cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF
else
    echo "✅ Client environment file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update api/.env with your MongoDB URI and Google OAuth credentials"
echo "2. Set up Google OAuth credentials:"
echo "   - Go to https://console.developers.google.com/"
echo "   - Create a new project or select existing one"
echo "   - Enable Google+ API"
echo "   - Create OAuth 2.0 credentials"
echo "   - Add http://localhost:5000/api/auth/google/callback as redirect URI"
echo "3. Start MongoDB (if running locally)"
echo "4. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📚 Documentation: See README.md for detailed instructions"
