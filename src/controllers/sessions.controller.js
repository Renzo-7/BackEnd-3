import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from "jsonwebtoken";
import UserDTO from "../dto/User.dto.js";
import logger from "../utils/logger.js";

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      logger.warn("Register attempt with incomplete values");
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    }

    const exists = await usersService.getUserByEmail(email);
    if (exists) {
      logger.warn(`Register failed: User already exists with email=${email}`);
      return res
        .status(400)
        .send({ status: "error", error: "User already exists" });
    }

    const hashedPassword = await createHash(password);
    const user = { first_name, last_name, email, password: hashedPassword };

    let result = await usersService.create(user);

    logger.info(`New user registered: ${email}`);
    res.send({ status: "success", payload: result._id });
  } catch (error) {
    logger.error("Error during user registration", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Login attempt with incomplete values");
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    }

    const user = await usersService.getUserByEmail(email);
    if (!user) {
      logger.warn(`Login failed: User not found with email=${email}`);
      return res
        .status(404)
        .send({ status: "error", error: "User doesn't exist" });
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      logger.warn(`Login failed: Incorrect password for email=${email}`);
      return res
        .status(400)
        .send({ status: "error", error: "Incorrect password" });
    }

    const userDto = UserDTO.getUserTokenFrom(user);
    const token = jwt.sign(userDto, "tokenSecretJWT", { expiresIn: "1h" });

    res
      .cookie("coderCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Logged in" });
    logger.info(`User logged in successfully: ${email}`);
  } catch (error) {
    logger.error("Error during login", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const current = async (req, res) => {
  try {
    const cookie = req.cookies["coderCookie"];
    if (!cookie) {
      logger.warn("Current user check failed: No cookie found");
      return res
        .status(401)
        .send({ status: "error", error: "Not authenticated" });
    }

    const user = jwt.verify(cookie, "tokenSecretJWT");
    logger.http(`Current user session validated: ${user.email}`);
    return res.send({ status: "success", payload: user });
  } catch (error) {
    logger.error("Error validating current session", error);
    res
      .status(401)
      .send({ status: "error", error: "Invalid or expired token" });
  }
};

const unprotectedLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.warn("Unprotected login attempt with incomplete values");
      return res
        .status(400)
        .send({ status: "error", error: "Incomplete values" });
    }

    const user = await usersService.getUserByEmail(email);
    if (!user) {
      logger.warn(
        `Unprotected login failed: User not found with email=${email}`
      );
      return res
        .status(404)
        .send({ status: "error", error: "User doesn't exist" });
    }

    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) {
      logger.warn(
        `Unprotected login failed: Incorrect password for email=${email}`
      );
      return res
        .status(400)
        .send({ status: "error", error: "Incorrect password" });
    }

    const token = jwt.sign(user, "tokenSecretJWT", { expiresIn: "1h" });

    res
      .cookie("unprotectedCookie", token, { maxAge: 3600000 })
      .send({ status: "success", message: "Unprotected Logged in" });
    logger.info(`User logged in (unprotected) successfully: ${email}`);
  } catch (error) {
    logger.error("Error during unprotected login", error);
    res.status(500).send({ status: "error", error: "Internal server error" });
  }
};

const unprotectedCurrent = async (req, res) => {
  try {
    const cookie = req.cookies["unprotectedCookie"];
    if (!cookie) {
      logger.warn("Unprotected current user check failed: No cookie found");
      return res
        .status(401)
        .send({ status: "error", error: "Not authenticated" });
    }

    const user = jwt.verify(cookie, "tokenSecretJWT");
    logger.http(`Unprotected current user session validated: ${user.email}`);
    return res.send({ status: "success", payload: user });
  } catch (error) {
    logger.error("Error validating unprotected session", error);
    res
      .status(401)
      .send({ status: "error", error: "Invalid or expired token" });
  }
};

export default {
  current,
  login,
  register,
  current,
  unprotectedLogin,
  unprotectedCurrent,
};
