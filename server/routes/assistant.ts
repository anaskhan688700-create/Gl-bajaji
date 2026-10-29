import { Router } from 'express';
import { AssistantService } from '../services/assistantService';

const router = Router();

router.post('/chat', async (req, res) => {
  const { question, farmId, language, history } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Question is required.',
    });
  }

  try {
    const result = await AssistantService.answerFarmerQuestion(
      question.trim(),
      farmId || 'farm-01',
      language || 'hi',
      history || []
    );

    res.json({
      success: true,
      question,
      language: language || 'hi',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Assistant error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process question with assistant.',
    });
  }
});

export default router;

