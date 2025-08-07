// const crypto = require('crypto');

// class QuantumCoinFlipAgent {
//   constructor() {
//     this.trialHistory = [];
//     this.privacyBudget = 1.0;
//     this.quantumServiceUrl = 'http://localhost:5001'; // Python service URL
//   }

//   // Check if Python quantum service is available
//   async isQuantumServiceAvailable() {
//     try {
//       const response = await fetch(`${this.quantumServiceUrl}/health`);
//       return response.ok;
//     } catch (error) {
//       console.warn('Quantum service not available:', error.message);
//       return false;
//     }
//   }

//   // Perform quantum coin flip via Python service
//   async performQuantumFlip() {
//     try {
//       // Try to use real quantum service first
//       if (await this.isQuantumServiceAvailable()) {
//         console.log('🔬 Using Python quantum service with Qiskit...');
        
//         const response = await fetch(`${this.quantumServiceUrl}/quantum-flip`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' }
//         });

//         if (response.ok) {
//           const quantumResult = await response.json();
//           console.log('⚛️ Quantum result received:', quantumResult.outcomes[0]);
          
//           return {
//             outcome: quantumResult.outcomes[0],
//             quantum: true,
//             timestamp: new Date(),
//             circuitDepth: quantumResult.circuit_depth,
//             gateCount: quantumResult.gate_count,
//             backend: 'qiskit_simulator',
//             shots: quantumResult.shots
//           };
//         }
//       }

//       // Fallback to classical if quantum service unavailable
//       console.warn('⚠️ Using classical fallback - quantum service unavailable');
//       return this.classicalFallback();

//     } catch (error) {
//       console.error('Quantum flip error:', error);
//       return this.classicalFallback();
//     }
//   }

//   // Classical fallback method
//   classicalFallback() {
//     const timestamp = Date.now().toString();
//     const randomBytes = crypto.randomBytes(32).toString('hex');
//     const combined = timestamp + randomBytes + Math.random().toString();
//     const hash = crypto.createHash('sha256').update(combined).digest('hex');
//     const firstByte = parseInt(hash.substring(0, 2), 16);

//     return {
//       outcome: firstByte % 2 === 0 ? 'Heads' : 'Tails',
//       quantum: false,
//       timestamp: new Date(),
//       circuitDepth: 1,
//       gateCount: 1,
//       backend: 'classical_fallback'
//     };
//   }

//   // Run autonomous trials via Python quantum service
//   async runAutonomousTrials(count, userId) {
//     try {
//       console.log(`🤖 Quantum Agent requesting ${count} trials from Python service...`);

//       // Check if quantum service is available
//       if (await this.isQuantumServiceAvailable()) {
//         const response = await fetch(`${this.quantumServiceUrl}/quantum-trials`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             count: count,
//             user_id: userId,
//             privacy_mode: true
//           })
//         });

//         if (response.ok) {
//           const quantumResult = await response.json();
          
//           if (quantumResult.success) {
//             console.log(`✅ Received ${quantumResult.total_trials} quantum results from Python service`);
//             return quantumResult.results;
//           } else {
//             throw new Error(quantumResult.error);
//           }
//         } else {
//           throw new Error(`Python service error: ${response.status}`);
//         }
//       }

//       // Fallback to classical trials
//       console.warn('⚠️ Using classical fallback for autonomous trials');
//       return await this.classicalAutonomousTrials(count, userId);

//     } catch (error) {
//       console.error('Autonomous trials error:', error);
//       // Fallback to classical
//       return await this.classicalAutonomousTrials(count, userId);
//     }
//   }

//   // Classical fallback for autonomous trials
//   async classicalAutonomousTrials(count, userId) {
//     const results = [];
//     const batchId = this.generatePseudonym(userId);
    
//     for (let i = 0; i < count; i++) {
//       const flipResult = this.classicalFallback();
      
//       const privacyPreservedResult = {
//         ...flipResult,
//         batchId,
//         trialNumber: i + 1,
//         userId: this.generatePseudonym(userId + i),
//         sessionId: this.generateSessionToken()
//       };
      
//       results.push(privacyPreservedResult);
//       await this.sleep(50); // Smaller delay for classical
//     }
    
//     return results;
//   }

//   // Generate pseudonym for privacy protection
//   generatePseudonym(identifier) {
//     const salt = process.env.PRIVACY_SALT || 'default_salt';
//     const hash = crypto.createHash('sha256').update(identifier + salt).digest('hex');
//     return hash.substring(0, 16);
//   }

//   // Generate session token
//   generateSessionToken() {
//     return crypto.randomBytes(16).toString('hex');
//   }

//   // Apply differential privacy noise
//   addDifferentialPrivacyNoise(value, epsilon = 0.1) {
//     const sensitivity = 1;
//     const scale = sensitivity / epsilon;
//     const noise = this.generateLaplaceNoise(scale);
//     return Math.max(0, Math.round(value + noise));
//   }

//   generateLaplaceNoise(scale) {
//     const u = Math.random() - 0.5;
//     return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
//   }

//   sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }
// }

// module.exports = QuantumCoinFlipAgent;

const crypto = require('crypto');

class QuantumCoinFlipAgent {
  constructor() {
    this.trialHistory = [];
    this.privacyBudget = 1.0;
    // ✅ Use environment variable for production deployment
    this.quantumServiceUrl = process.env.QUANTUM_SERVICE_URL || 'http://localhost:5001';
  }

  // Check if Python quantum service is available
  async isQuantumServiceAvailable() {
    try {
      const response = await fetch(`${this.quantumServiceUrl}/health`);
      return response.ok;
    } catch (error) {
      console.warn('Quantum service not available:', error.message);
      return false;
    }
  }

  // Perform quantum coin flip via Python service
  async performQuantumFlip() {
    try {
      // Try to use real quantum service first
      if (await this.isQuantumServiceAvailable()) {
        console.log('🔬 Using Python quantum service with Qiskit...');
        console.log(`🔗 Connecting to: ${this.quantumServiceUrl}`);
        
        const response = await fetch(`${this.quantumServiceUrl}/quantum-flip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const quantumResult = await response.json();
          console.log('⚛️ Quantum result received:', quantumResult.outcomes[0]);
          
          return {
            outcome: quantumResult.outcomes[0],
            quantum: true,
            timestamp: new Date(),
            circuitDepth: quantumResult.circuit_depth,
            gateCount: quantumResult.gate_count,
            backend: 'qiskit_simulator',
            shots: quantumResult.shots
          };
        }
      }

      // Fallback to classical if quantum service unavailable
      console.warn('⚠️ Using classical fallback - quantum service unavailable');
      return this.classicalFallback();

    } catch (error) {
      console.error('Quantum flip error:', error);
      return this.classicalFallback();
    }
  }

  // Classical fallback method
  classicalFallback() {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const combined = timestamp + randomBytes + Math.random().toString();
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    const firstByte = parseInt(hash.substring(0, 2), 16);

    return {
      outcome: firstByte % 2 === 0 ? 'Heads' : 'Tails',
      quantum: false,
      timestamp: new Date(),
      circuitDepth: 1,
      gateCount: 1,
      backend: 'classical_fallback'
    };
  }

  // Run autonomous trials via Python quantum service
  async runAutonomousTrials(count, userId) {
    try {
      console.log(`🤖 Quantum Agent requesting ${count} trials from Python service...`);
      console.log(`🔗 Service URL: ${this.quantumServiceUrl}`);

      // Check if quantum service is available
      if (await this.isQuantumServiceAvailable()) {
        const response = await fetch(`${this.quantumServiceUrl}/quantum-trials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            count: count,
            user_id: userId,
            privacy_mode: true
          })
        });

        if (response.ok) {
          const quantumResult = await response.json();
          
          if (quantumResult.success) {
            console.log(`✅ Received ${quantumResult.total_trials} quantum results from Python service`);
            return quantumResult.results;
          } else {
            throw new Error(quantumResult.error);
          }
        } else {
          throw new Error(`Python service error: ${response.status}`);
        }
      }

      // Fallback to classical trials
      console.warn('⚠️ Using classical fallback for autonomous trials');
      return await this.classicalAutonomousTrials(count, userId);

    } catch (error) {
      console.error('Autonomous trials error:', error);
      console.error(`Failed to connect to quantum service at: ${this.quantumServiceUrl}`);
      // Fallback to classical
      return await this.classicalAutonomousTrials(count, userId);
    }
  }

  // Classical fallback for autonomous trials
  async classicalAutonomousTrials(count, userId) {
    const results = [];
    const batchId = this.generatePseudonym(userId);
    
    console.log(`🔄 Running ${count} classical trials as fallback...`);
    
    for (let i = 0; i < count; i++) {
      const flipResult = this.classicalFallback();
      
      const privacyPreservedResult = {
        ...flipResult,
        batchId,
        trialNumber: i + 1,
        userId: this.generatePseudonym(userId + i),
        sessionId: this.generateSessionToken()
      };
      
      results.push(privacyPreservedResult);
      await this.sleep(50); // Smaller delay for classical
    }
    
    console.log(`✅ Completed ${count} classical trials`);
    return results;
  }

  // Generate pseudonym for privacy protection
  generatePseudonym(identifier) {
    const salt = process.env.PRIVACY_SALT || 'default_salt';
    const hash = crypto.createHash('sha256').update(identifier + salt).digest('hex');
    return hash.substring(0, 16);
  }

  // Generate session token
  generateSessionToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Apply differential privacy noise
  addDifferentialPrivacyNoise(value, epsilon = 0.1) {
    const sensitivity = 1;
    const scale = sensitivity / epsilon;
    const noise = this.generateLaplaceNoise(scale);
    return Math.max(0, Math.round(value + noise));
  }

  generateLaplaceNoise(scale) {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ✅ New method: Get service configuration info
  getServiceInfo() {
    return {
      quantumServiceUrl: this.quantumServiceUrl,
      privacySalt: process.env.PRIVACY_SALT ? 'configured' : 'using_default',
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

module.exports = QuantumCoinFlipAgent;
