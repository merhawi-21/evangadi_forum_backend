// db Connection
import  dbPromise  from "../db/dbconfig.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import validator from "validator";
import dotenv from 'dotenv';
dotenv.config();
async function register(req, res) {
  console.log(req.body)
  const { userName, firstName, lastName, email, password } = req.body;
  if (!email || !password || !firstName || !lastName || !userName) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "please provide all required fields!" }); //404
  }
  try {
    const [user] = await dbPromise.query(
      "select userName,userId from users where userName =? or email =? ",
      [userName, email]
    );
    if (user.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "user already existed" });
    }
    //validating  strong password and email format
    if (password.length <= 8) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        msg: "password must be at least 8 characters",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        msg: "Please enter a valid email",
      });
    }
    // encrypt the password//123456789
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await dbPromise.query(
      "INSERT INTO users (userName, firstName, lastName,email,password) VALUES (?,?,?,?,?) ",
      [userName, firstName, lastName, email, hashedPassword]
    );
    // return res.status(StatusCodes.CREATED).json({ msg: "user register" });
    const [data] = await dbPromise.query(`SELECT * FROM users`);
    // After saving user, create a JWT token
    const userId = data[data.length - 1].userId;
    const token = jwt.sign({ userName, userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(StatusCodes.OK).json({
      data: data[data.length - 1],
      token: token,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "something went wrong, try again later!" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "please enter all required fields!" });
  }
  try {
    const [user] = await dbPromise.query(
      "select userName,userId,password from users where email=?",
      [email]
    );

    if (user.length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "invalid credential!" });
    }
    //compare password
    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "invalid credential" });
    }
    const userName = user[0].userName;
    const userId = user[0].userId;
    const token = jwt.sign({ userName, userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(StatusCodes.OK)
      .json({ msg: "user login successfull", token, userName });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "something went wrong, try again later!" });
  }
}
async function checkUser(req, res) {
  const userName = req.user.userName;
  const userId = req.user.userId;
  res.status(StatusCodes.OK).json({ msg: "valid user", userName, userId });
}
async function logOut(req, res) {
  return res.status(StatusCodes.OK).json({
    success:true,
    msg: "successfuly logout" });
}


export { register, login, checkUser, logOut };
