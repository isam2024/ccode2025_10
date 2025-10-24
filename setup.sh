#!/bin/bash

echo "=========================================="
echo "Midjourney-ComfyUI Clone Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✓ npm found: $(npm --version)"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created. Please edit it with your settings."
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✓ Backend dependencies installed"
echo ""

echo "Installing frontend dependencies..."
cd client
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✓ Frontend dependencies installed"
cd ..
echo ""

# Create output directory
mkdir -p output/images
echo "✓ Output directory created"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure ComfyUI is running at http://127.0.0.1:8188"
echo "   If not, start ComfyUI first."
echo ""
echo "2. Edit .env file if needed to configure:"
echo "   - ComfyUI host and port"
echo "   - Server port"
echo "   - Images directory"
echo ""
echo "3. Start the application:"
echo "   npm run dev     (for development)"
echo "   npm start       (for production)"
echo ""
echo "4. Open your browser to:"
echo "   http://localhost:3000 (development)"
echo "   http://localhost:3001 (production)"
echo ""
echo "=========================================="
