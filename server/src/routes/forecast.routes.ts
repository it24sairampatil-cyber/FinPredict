// FinPredict.js - Neural Forecast MongoDB Routes
import { Router, Response } from 'express';
import { Forecast } from '../models/Forecast.js';
import { authenticateJwt, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/forecast (Save forecast result)
router.post('/', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      datasetName,
      totalHistoricalOutflow,
      totalPredictedOutflow,
      projectedNetSavings,
      projectedSavingsRate,
      categoryForecasts,
      modelMetrics
    } = req.body;

    const forecast = new Forecast({
      userId,
      datasetName: datasetName || 'Tech Professional Profile',
      totalHistoricalOutflow,
      totalPredictedOutflow,
      projectedNetSavings,
      projectedSavingsRate,
      categoryForecasts,
      modelMetrics
    });

    await forecast.save();
    res.status(201).json({ message: 'Neural forecast saved to MongoDB.', forecastId: forecast._id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to persist forecast.', details: err.message });
  }
});

// GET /api/forecast/latest (Retrieve latest forecast)
router.get('/latest', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const latest = await Forecast.findOne({ userId }).sort({ createdAt: -1 });
    if (!latest) {
      res.status(404).json({ error: 'No forecasts found for user.' });
      return;
    }
    res.json({ forecast: latest });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch latest forecast.', details: err.message });
  }
});

export default router;
