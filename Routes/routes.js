const express = require('express');
const router = express.Router();
const CoinFlip = require('../model/inventory');
const authenticateJWT = require('../middleware/auth');
const QuantumCoinFlipAgent = require('../services/quantumCoinFlip');

const quantumAgent = new QuantumCoinFlipAgent();

// 🔓 Public GET endpoint – simple coin flip (no database)
router.get('/flip', (req, res) => {
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  res.status(200).json({ result });
});

// 🔐 Classical flip with database storage
router.post('/flip', authenticateJWT, async (req, res) => {
  try {
    const { result } = req.body;
    const userId = req.user.id;

    console.log(`💾 Saving classical flip for user: ${userId}, result: ${result}`);

    const newFlip = new CoinFlip({ 
      result, 
      userId: userId,
      timestamp: new Date(),
      quantum: false
    });
    
    const saved = await newFlip.save();
    console.log(`✅ Saved classical flip with ID: ${saved._id}`);
    
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error("Error saving classical flip:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔐 NEW: Quantum coin flip with database storage
router.post('/quantum-flip', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { trials = 1, privacyMode = true } = req.body;
    
    console.log(`⚛️ Quantum flip request: ${trials} trials for user ${userId}`);
    
    if (trials > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Maximum 100 trials per request" 
      });
    }

    // Run quantum trials via Python service
    const results = await quantumAgent.runAutonomousTrials(trials, userId);
    
    console.log(`🔬 Received ${results.length} quantum results, saving to database...`);
    
    // Store quantum results in database
    const savedResults = [];
    for (const result of results) {
      const newFlip = new CoinFlip({
        result: result.outcome,
        userId: userId, // Use actual userId for database queries (not pseudonymized)
        batchId: result.batch_id || result.batchId,
        quantum: true, // Mark as quantum
        timestamp: new Date(result.timestamp),
        sessionId: result.session_id || result.sessionId,
        privacyPreserved: privacyMode,
        circuitDepth: result.circuit_depth || result.circuitDepth,
        gateCount: result.gate_count || result.gateCount
      });
      
      const saved = await newFlip.save();
      savedResults.push(saved);
      console.log(`✅ Saved quantum flip ${saved._id}: ${saved.result}`);
    }

    // Generate aggregated statistics
    const headsCount = results.filter(r => r.outcome === 'Heads').length;
    const tailsCount = results.filter(r => r.outcome === 'Tails').length;
    
    const privacyPreservedStats = privacyMode ? {
      headsCount: quantumAgent.addDifferentialPrivacyNoise(headsCount),
      tailsCount: quantumAgent.addDifferentialPrivacyNoise(tailsCount),
      totalTrials: trials,
      privacyBudgetUsed: 0.1,
      quantum: true
    } : { 
      headsCount, 
      tailsCount, 
      totalTrials: trials,
      quantum: true 
    };

    console.log(`📊 Quantum flip completed: ${headsCount} heads, ${tailsCount} tails`);

    res.status(201).json({
      success: true,
      data: {
        batchId: results[0]?.batch_id || results[0]?.batchId,
        trials: trials,
        quantum: true,
        backend: results[0]?.backend || 'qiskit_simulator',
        statistics: privacyPreservedStats,
        lastResult: results[results.length - 1]?.outcome,
        savedCount: savedResults.length
      }
    });

  } catch (error) {
    console.error("Error in quantum flip:", error);
    res.status(500).json({ 
      success: false, 
      message: "Quantum agent error",
      error: error.message 
    });
  }
});

// 🔐 Get user flip history
router.get('/history', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📊 Fetching history for user: ${userId}`);
    
    const history = await CoinFlip.find({ 
      userId: userId 
    })
    .sort({ timestamp: -1 })
    .limit(100);
    
    console.log(`✅ Found ${history.length} flips for user ${userId}`);
    
    res.status(200).json({ 
      success: true, 
      data: history,
      userId: userId,
      count: history.length
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
});

module.exports = router;
