// FinPredict.js - Transaction Ledger MongoDB Routes
import { Router, Response } from 'express';
import { Transaction } from '../models/Transaction.js';
import { authenticateJwt, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/transactions/bulk (Ingest parsed transactions)
router.post('/bulk', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      res.status(400).json({ error: 'transactions must be a non-empty array.' });
      return;
    }

    const userId = req.user?.id;
    const docs = transactions.map((t: any) => ({
      userId,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      rawAmount: t.rawAmount || t.amount,
      balance: t.balance,
      isAnomaly: Boolean(t.isAnomaly)
    }));

    await Transaction.insertMany(docs);

    res.status(201).json({
      message: `Successfully ingested ${docs.length} transactions into MongoDB.`,
      count: docs.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Bulk transaction ingestion failed.', details: err.message });
  }
});

// GET /api/transactions (Retrieve user transactions with filter and pagination)
router.get('/', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, search, page = '1', limit = '100' } = req.query;

    const query: any = { userId };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.description = { $regex: String(search), $options: 'i' };
    }

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    res.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve transactions.', details: err.message });
  }
});

// DELETE /api/transactions (Ephemeral Purge)
router.delete('/', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await Transaction.deleteMany({ userId });
    res.json({
      message: 'User transaction ledger successfully purged from MongoDB.',
      deletedCount: result.deletedCount
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Transaction purge failed.', details: err.message });
  }
});

export default router;
