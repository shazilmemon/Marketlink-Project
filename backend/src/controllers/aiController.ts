import { Request, Response } from 'express';
import { aiRequestService } from '../services/AIRequestService';
import { sendSuccess, sendError } from '../utils/response';

export const chatAssistant = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const userId = (req.user as any)?.id || 'anonymous';
    const role = (req.user as any)?.role || 'customer';
    
    const reply = await aiRequestService.getAssistantResponse(message, userId, role);
    return sendSuccess(res, { reply });
  } catch (err: any) {
    return sendError(res, err.message, 500, 'AI_ERROR');
  }
};
