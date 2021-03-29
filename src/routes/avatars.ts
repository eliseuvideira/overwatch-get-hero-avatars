import { Router } from 'express';
import { avatarsPost } from '../endpoints/avatars';

const router = Router();

/**
 * POST /avatars
 * @tag Avatars
 * @response 204
 * @response default
 * @responseContent {Error} default.application/json
 */
router.post('/avatars', avatarsPost);

export default router;
