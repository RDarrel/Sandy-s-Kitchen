const Entity = require("../models/Projects");

const array = [
  {
    name: "Machine Learning",
    client: "647dd2a5dced91b0b39444b6",
    developers: [
      "647dd2a5dced91b0b39444b5",
      "647dd2a5dced91b0b39444b7",
      "647dd2a5dced91b0b39444b8",
    ],
    duration: {
      start: "2023-06-01",
      end: "2023-06-30",
    },
    price: 20000,
  },
];

exports.projects = (req, res) =>
  Entity.insertMany(array)
    .then(response => {
      res.status(201).json({
        message: "Success",
        paylaod: response,
      });
    })
    .catch(err => res.status(400).json({ message: err.message }));
