// FinPredict.js - Simplex LP Scenario Routes
import { Router, Response } from 'express';
import { BudgetScenario } from '../models/BudgetScenario.js';
import { authenticateJwt, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/simplex/scenario (Save or update scenario)
router.post('/scenario', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      scenarioName,
      targetSavingsRate,
      recommendedAllocation,
      deltas,
      projectedSavings,
      savingsRateAchieved,
      iterations,
      rebalanceActions
    } = req.body;

    const scenario = await BudgetScenario.findOneAndUpdate(
      { userId, scenarioName },
      {
        userId,
        scenarioName,
        targetSavingsRate,
        recommendedAllocation,
        deltas,
        projectedSavings,
        savingsRateAchieved,
        iterations: iterations || 2,
        rebalanceActions: rebalanceActions || []
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Budget scenario saved to MongoDB.', scenario });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to persist scenario.', details: err.message });
  }
});

// GET /api/simplex/scenarios (Get all saved scenarios for user)
router.get('/scenarios', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const scenarios = await BudgetScenario.find({ userId });
    res.json({ scenarios });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve scenarios.', details: err.message });
  }
});

export default router;
