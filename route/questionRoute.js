
// API endpoints
import express from 'express';
const router=express.Router();
import {getAllQuestions,getSingleQuestion,postQuestion} from '../controller/questionController.js';
router.post("/question",postQuestion);
 router.get("/question/:questionId", getSingleQuestion);
 // Define the route for fetching all questions
 router.get("/question",getAllQuestions);
 export default router;


