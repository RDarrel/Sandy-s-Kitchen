const Entity = require("../models/Roles");

const array = [
  {
    _id: "647dd18adced91b0b39444ab",
    name: "ADMINISTRATOR",
  },
  {
    _id: "647dd1e9dced91b0b39444ad",
    name: "MODERATOR",
  },
  {
    _id: "647dd209dced91b0b39444af",
    name: "DEVELOPER",
  },
  {
    _id: "647dd9120874515a8fc47afb",
    name: "CLIENT",
  },
  {
    _id: "64834b49033916fc83e236c5",
    name: "STUDENT",
  },
];

exports.roles = (req, res) =>
  Entity.insertMany(array)
    .then(response => {
      res.status(201).json({
        message: "Success",
        paylaod: response,
      });
    })
    .catch(err => res.status(400).json({ message: err.message }));
