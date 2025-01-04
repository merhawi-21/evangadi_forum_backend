//! Endpoint Implementation:

// Load the Express framework to handle HTTP requests and responses.
// const KeywordExtractor = require("keyword-extractor");
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import keywordExtractor from "keyword-extractor";
import  dbPromise  from "../db/dbconfig.js";
import { console } from "inspector/promises";

async function postQuestion(req, res) {
  const { title, description } = req.body;

  // Check for missing items
  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Please provide all required fields!",
    });
  }
  const generateTag = (title) => {
    const extractionResult = keywordExtractor.extract(title, {
      language: "english",
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true,
    });
    return extractionResult.length > 0 ? extractionResult[0] : "general";
  };
  try {
    // get userid from user
    const { userId } = req.user;

    // get a unique identifier for questionid so two questions do not end up having the same id. crypto built in node module.
    const questionId = parseInt(
      crypto.randomBytes(8).toString("hex").slice(0, 8),
      16
    );

    const tag = generateTag(title);

    // Insert question into database
    await dbPromise.query(
      "INSERT INTO questions ( userId, questionId, title, description, tag, created_at) VALUES (?,?,?,?,?,?)",
      [userId, questionId, title, description, tag, new Date()]
    );

    return res.status(StatusCodes.CREATED).json({
      msg: "Question created successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "An unexpected error occurred.",
    });
  }
}

async function getSingleQuestion(req, res) {
  const { questionId } = req.params;
  console.log(questionId);
  if (!questionId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid question ID" });
  }
  try {
    // Query the database to get the question details
    const [question] = await dbPromise.query(
      `SELECT questions.questionId, questions.title, questions.description, users.userName, questions.created_at FROM questions JOIN users ON users.userId = questions.userId WHERE questionId = ?`,
      [questionId]
    );

    //  If no question found, return 404
    if (question.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Question not found" });
    }
    // Return the question details
    return res.status(StatusCodes.OK).json(question[0]);
  } catch (error) {
    console.error(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred" });
  }
}

async function getAllQuestions(req, res) {
  try {
    // Query the database to fetch all questions
    const [questions] = await dbPromise.query(`
      SELECT q.questionId, q.title, q.description, q.userId, q.created_at, u.userName, u.firstName, u.lastName, (SELECT COUNT(*) FROM answers WHERE answers.questionId = q.questionId) AS total_answers FROM questions AS q JOIN users AS u ON q.userId = u.userId`); // Fetch data from 'questions' table
    console.log(questions);
    // Send the response JSON payload
    return res.status(200).json({
      success: true,
      count: questions.length, // Number of questions
      data: questions, // Array of questions
    });
  } catch (error) {
    // Handle server errors
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
}

export { getSingleQuestion, postQuestion, getAllQuestions };
