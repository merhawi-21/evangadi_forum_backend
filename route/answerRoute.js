import express from 'express'
const router = express.Router();

import { postAnswer,getAnswer,deleteAnswerByUser } from '../controller/answerController.js';
// answer route
router.post("/answer", postAnswer);
router.get("/answer/:questionId", getAnswer);
  //delete answer by user
router.delete("/answer/:userId", deleteAnswerByUser);

export default router;  // export the router
