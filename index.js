import express  from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnection  from './db/dbconfig.js';
import answerRouter from './route/answerRoute.js';
import questionRouter from './route/questionRoute.js';
import userRouter from './route/userRoute.js';
import authMiddleware from './middleWare/authMiddleware.js';


const app=express();
dotenv.config();
app.use(cors())

// json middleware to extract json data
app.use(express.json())

//app.use("api/answer",answerRouter)

const port=process.env.PORT;
//user routes middleware
app.use("/api/user", userRouter);
//question routes middleware
app.use("/api", authMiddleware, questionRouter);
//answer routes middleware
app.use("/api", authMiddleware, answerRouter);
//using get http method (to request data from server)
app.get("/", (req, res) => {
  res.send("API Working");
});

//new method of server starter with db connection
const startConnection = async () => {
  try {
    const result = await dbConnection.query("select 'test'");
    console.log(result);
    await app.listen(port);
    //console.log("database connected");
    //console.log(`server running on {http://localhost}:${port}`);
  } catch (error) {
    console.log(error.message);
  }
};
startConnection();

