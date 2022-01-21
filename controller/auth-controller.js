const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const catchError = require("../utils/catch-error");

module.exports = {
  register: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(5).required(),
        photo: Joi.string().required(),
      });
      const { error } = schema.validate(body);
      if (error) {
        res.status(400).json({
          status: "Bad Request",
          message: error.message,
          result: {},
        });
      }

      const check = await Users.findOne({
        where: {
          email: body.email,
        },
      });
      if (check) {
        return res.status(400).json({
          status: "Bad Request",
          message:
            "Email Already Registered, Please Login or Use Another Email",
          result: {},
        });
      }

      const hashPassword = await bcrypt.hash(body.password, 10);

      const user = await Users.create({
        name: body.name,
        email: body.email,
        password: hashPassword,
      });

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.SECRET_TOKEN,
        { expiresIn: 60 * 60 * 12 }
      );
      res.status(200).json({
        status: "OK",
        message: "Successfuly Create Data",
        result: { token: token },
      });
    } catch (error) {
      catchError(res, error);
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).required(),
      });

      const { error } = schema.validate({ ...req.body });
      if (error) {
        return res.status(400).json({
          status: "Bad Request",
          message: error.message,
          result: {},
        });
      }

      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          status: "Not Authorized Account",
          message: "Invalid Email or Password",
          result: {},
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({
          status: "Not Authorized Account",
          message: "Invalid Email or Password",
          result: {},
        });
      }

      const token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.SECRET_TOKEN,
        { expiresIn: 60 * 60 * 12 }
      );

      res.status(200).json({
        status: "OK",
        message: "Successfuly Logged In",
        result: { token },
      });
    } catch (error) {
      catchError(res, error);
    }
  },
};
