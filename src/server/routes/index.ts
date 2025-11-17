import { Router } from 'express';

const router = Router();

// Health check route (already handled in server.ts, but can add more here)
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

export default router;
