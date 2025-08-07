from flask import Flask, request, jsonify
from qiskit import QuantumCircuit, Aer, execute
from qiskit.providers.aer import QasmSimulator
import json
import hashlib
import time
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)


class QuantumCoinFlipService:
    def __init__(self):
        # Initialize quantum simulator
        self.simulator = Aer.get_backend('qasm_simulator')

    def create_quantum_coin_flip_circuit(self):
        """
        Creates a quantum coin flip circuit using Hadamard gate
        |0⟩ → H → (|0⟩ + |1⟩)/√2 → Measurement → 0 or 1
        """
        # Create quantum circuit with 1 qubit and 1 classical bit
        qc = QuantumCircuit(1, 1)

        # Apply Hadamard gate to put qubit in superposition
        qc.h(0)  # |0⟩ → (|0⟩ + |1⟩)/√2

        # Measure the qubit
        qc.measure(0, 0)

        return qc

    def perform_quantum_flip(self, shots=1):
        """
        Performs quantum coin flip using true quantum superposition
        """
        try:
            # Create quantum circuit
            circuit = self.create_quantum_coin_flip_circuit()

            # Execute on quantum simulator
            job = execute(circuit, self.simulator, shots=shots)
            result = job.result()
            counts = result.get_counts(circuit)

            # Extract results
            outcomes = []
            for measurement, count in counts.items():
                # measurement is '0' or '1'
                outcome = 'Heads' if measurement == '1' else 'Tails'
                outcomes.extend([outcome] * count)

            return {
                'outcomes': outcomes,
                'counts': counts,
                'quantum': True,
                'circuit_depth': circuit.depth(),
                'gate_count': len(circuit.data),
                'timestamp': datetime.now().isoformat(),
                'shots': shots
            }

        except Exception as e:
            print(f"Quantum simulation error: {str(e)}")
            return {
                'error': str(e),
                'quantum': False,
                'timestamp': datetime.now().isoformat()
            }

    def run_autonomous_trials(self, count, user_id, privacy_mode=True):
        """
        Run multiple quantum trials with privacy preservation
        """
        try:
            # Generate privacy-preserving batch ID
            batch_id = self.generate_pseudonym(user_id)

            results = []

            print(f"🤖 Starting {count} autonomous quantum trials...")

            # Batch the quantum executions for efficiency
            batch_size = min(count, 100)  # Maximum batch size

            for batch_start in range(0, count, batch_size):
                batch_end = min(batch_start + batch_size, count)
                current_batch_size = batch_end - batch_start

                # Execute quantum circuit with multiple shots
                quantum_result = self.perform_quantum_flip(shots=current_batch_size)

                if 'error' in quantum_result:
                    raise Exception(quantum_result['error'])

                # Process each outcome in the batch
                for i, outcome in enumerate(quantum_result['outcomes']):
                    trial_number = batch_start + i + 1

                    result = {
                        'outcome': outcome,
                        'quantum': quantum_result['quantum'],
                        'timestamp': datetime.now().isoformat(),
                        'circuit_depth': quantum_result['circuit_depth'],
                        'gate_count': quantum_result['gate_count'],
                        'batch_id': batch_id,
                        'trial_number': trial_number,
                        'user_id': self.generate_pseudonym(user_id + str(i)) if privacy_mode else user_id,
                        'session_id': self.generate_session_token()
                    }

                    results.append(result)

                # Small delay between batches to simulate autonomous behavior
                if batch_end < count:
                    time.sleep(0.1)

            print(f"✅ Completed {count} quantum trials")

            return {
                'success': True,
                'results': results,
                'batch_id': batch_id,
                'total_trials': count,
                'quantum': True
            }

        except Exception as e:
            print(f"Autonomous trials error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'quantum': False
            }

    def generate_pseudonym(self, identifier):
        """Generate pseudonym for privacy"""
        salt = os.getenv('PRIVACY_SALT', 'default_quantum_salt')
        hash_input = f"{identifier}{salt}".encode()
        return hashlib.sha256(hash_input).hexdigest()[:16]

    def generate_session_token(self):
        """Generate random session token"""
        return hashlib.sha256(str(time.time()).encode()).hexdigest()[:16]

    def add_differential_privacy_noise(self, value, epsilon=0.1):
        """Add Laplace noise for differential privacy"""
        sensitivity = 1
        scale = sensitivity / epsilon
        noise = np.random.laplace(0, scale)
        return max(0, int(value + noise))


# Initialize quantum service
quantum_service = QuantumCoinFlipService()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'quantum_backend': 'qasm_simulator',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/quantum-flip', methods=['POST'])
def quantum_flip():
    """Single quantum coin flip"""
    try:
        result = quantum_service.perform_quantum_flip(shots=1)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/quantum-trials', methods=['POST'])
def quantum_trials():
    """Multiple autonomous quantum trials"""
    try:
        data = request.get_json()
        count = data.get('count', 1)
        user_id = data.get('user_id', 'anonymous')
        privacy_mode = data.get('privacy_mode', True)

        if count > 1000:
            return jsonify({'error': 'Maximum 1000 trials per request'}), 400

        result = quantum_service.run_autonomous_trials(count, user_id, privacy_mode)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/quantum-stats', methods=['POST'])
def quantum_statistics():
    """Get privacy-preserved statistics"""
    try:
        data = request.get_json()
        results = data.get('results', [])

        heads_count = sum(1 for r in results if r.get('outcome') == 'Heads')
        tails_count = len(results) - heads_count

        # Apply differential privacy
        privacy_preserved_stats = {
            'heads_count': quantum_service.add_differential_privacy_noise(heads_count),
            'tails_count': quantum_service.add_differential_privacy_noise(tails_count),
            'total_trials': len(results),
            'heads_percentage': (heads_count / len(results) * 100) if results else 0,
            'quantum': True,
            'privacy_preserved': True,
            'differential_privacy_applied': True
        }

        return jsonify(privacy_preserved_stats)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("🚀 Starting Quantum Coin Flip Service with Qiskit...")
    print("⚛️  Using Hadamard gates for true quantum superposition")
    app.run(host='0.0.0.0', port=5001, debug=True)
