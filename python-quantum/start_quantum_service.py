import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import and run the quantum service
from quantum_service import app

if __name__ == '__main__':
    print("🔬 Quantum Coin Flip Service Starting...")
    print("⚛️  Hadamard Gate Quantum Superposition Enabled")
    print("🔒 Privacy-Preserving Mode Active")
    app.run(host='0.0.0.0', port=5001, debug=True)
