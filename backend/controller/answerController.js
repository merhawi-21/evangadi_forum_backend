import  dbPromise  from '../db/dbconfig.js';
import {StatusCodes} from 'http-status-codes';
async function postAnswer(req, res) {
  // res.send("answer")
  const { questionId, answer } = req.body;
  // no need to check question id becouse it will be avaliable with the question so we
  // will check only answer
  if (!answer) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "please provide answer" });
  }
  try {
    const userId=req.user.userId;
    await dbPromise.query(
      "INSERT INTO answers(questionId,answer,userId) VALUES(?,?,?)",
      [questionId, answer, userId]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Answer posted successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
}
//Solomon
async function getAnswer (req, res) {
  const questionId = req.params.questionId;
  console.log(questionId);
  try {
    //select * from answers where questionId=?,[questionId];
    const [answer] = await dbPromise.query(
      `SELECT 
        q.questionId, q.answer, q.answerId, q.userId, q.created_at, u.userName, u.firstName, u.lastName FROM answers AS q JOIN users AS u ON q.userId = u.userId WHERE q.questionId = ?`,  
      [questionId]
    );
    // if (!answer || answer.length === 0) {
    //   return res.status(StatusCodes.NOT_FOUND).json({
    //     msg: "No answers found for this question.",
    //   });
    // }
    return res.status(StatusCodes.OK).json(answer);
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, try again later!",
    });
  }
};
//additional api for deleting answer by user
const deleteAnswerByUser = async (req, res) => {
  // const userId = req.user.userId;
  // const questionId = req.params.questionId;
  const { userId } = req.params;

  try {
    // Delete the answers by userId
    const answer = await dbPromise.query(
      "DELETE FROM answers WHERE userId = ?",
      [userId]
    );
    // Respond with success message
    if (answer.affectedRows === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: true,
        msg: "Answer not found",
      });
    } else {
      // Check if any answers were deleted
      return res.status(StatusCodes.OK).json({
        success: true,
        msg: "Answer removed successfully",
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      msg: "Something went wrong, try again later!",
    });
  }
};
export{ postAnswer, getAnswer,deleteAnswerByUser };
