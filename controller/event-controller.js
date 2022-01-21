const Joi = require("joi");
const { Events } = require("../models");
const catchError = require("../utils/catch-error");
const { Op } = require("sequelize");
const moment = require("moment");

module.exports = {
  createEvent: async (req, res) => {
    const body = req.body;
    const file = req.file;
    try {
      const schema = Joi.object({
        title: Joi.string().required(),
        desc: Joi.required(),
        category: Joi.required(),
        image: Joi.string().required(),
        date: Joi.date().required(),
      });

      const { error } = schema.validate({ ...body, image: file.path });
      if (error) {
        return res.status(400).json({
          status: "Bad Request",
          message: error.message,
          result: {},
        });
      }

      const event = await Events.create({ ...body, image: file.path });
      if (!event) {
        return res.status(500).json({
          status: "Internal Server Error",
          message: "Error to create the data",
          result: {},
        });
      }

      res.status(201).json({
        status: "OK",
        message: "Successfuly create data",
        result: event,
      });
    } catch (error) {
      catchError(res, error);
    }
  },
  getEvents: async (req, res) => {
    const { order, date, category, limit, page } = req.query;
    try {
      // sort by date
      let sort;
      switch (order) {
        case "old":
          sort = ["createdAt", "ASC"];
          break;
        case "name":
          sort = ["title", "ASC"];
          break;
        default:
          sort = ["createdAt", "DESC"];
          break;
      }

      //sort datetime
      let today = new Date(),
        y = today.getFullYear(),
        m = today.getMonth(),
        d = today.getDate();
      let first, last;
      let dateRange;
      switch (date) {
        case "today":
          first = moment().startOf("day").toDate();
          last = moment().endOf("day").toDate();
          dateRange = {
            date: {
              [Op.between]: [first, last],
            },
          };
          break;
        case "tomorrow":
          first = moment().endOf("day").toDate();
          last = moment().add(1, "day").endOf("day").toDate();
          dateRange = {
            date: {
              [Op.between]: [first, last],
            },
          };
          break;
        case "week":
          first = moment().startOf("week").toDate();
          last = moment().endOf("week").toDate();
          dateRange = {
            date: {
              [Op.between]: [first, last],
            },
          };
          break;
        case "month":
          first = moment().startOf("month").toDate();
          last = moment().endOf("month").toDate();
          dateRange = {
            date: {
              [Op.between]: [first, last],
            },
          };
          break;
        case "year":
          first = moment().startOf("year").toDate();
          last = moment().endOf("year").toDate();
          dateRange = {
            date: {
              [Op.between]: [first, last],
            },
          };
          break;
      }
      // sort Category
      let categoryQuery;
      if (category) {
        categoryQuery = {
          category: category,
        };
      }
      console.log(categoryQuery);

      // sort pagination
      if (!page) {
        page - 1;
      }

      // limit data
      let limitData;
      if (limit) {
        limitData = Number(limit);
      } else {
        limitData = 8;
      }

      const events = await Events.findAll({
        limit: limitData,
        offset: [(page - 1) * limitData],
        order: [sort],
        where: {
          ...dateRange,
          ...categoryQuery,
        },
      });

      if (events.length == 0) {
        return res.status(404).json({
          status: "Data Not Found",
          message: "The data is empty",
          result: [],
        });
      }

      return res.status(200).json({
        status: "OK",
        message: "Successfuly retrieve data",
        result: events,
      });
    } catch (error) {
      catchError(res, error);
    }
  },
};
