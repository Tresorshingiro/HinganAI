#!/bin/bash

echo "🚀 Setting up HinganAI Agriculture Platform Backend"
echo "================================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before running the server"
fi

# Create necessary directories
mkdir -p uploads
mkdir -p models

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys:"
echo "   - SUPABASE_URL and SUPABASE_KEY"
echo "   - OPENWEATHER_API_KEY"
echo "   - FLASK_SECRET_KEY"
echo ""
echo "2. Run the server:"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:5000"