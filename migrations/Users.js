const Entity = require("../models/Users");

const array = [
  {
    _id: "647dd2a5dced91b0b39444b3",
    fullName: {
      fname: "BENEDICT EARLE GABRIEL",
      mname: "ROMERO",
      lname: "PAJARILLAGA",
    },
    role: "647dd18adced91b0b39444ab", // Administrator
    email: "admin@gmail.com",
    password: "password",
  },
  {
    _id: "647dd2a5dced91b0b39444b4",
    fullName: {
      fname: "KIMBERLY",
      mname: "PENAFLOR",
      lname: "SARMIENTO",
    },
    role: "647dd1e9dced91b0b39444ad", // Moderator
    email: "mod@gmail.com",
    password: "password",
  },
  {
    _id: "647dd2a5dced91b0b39444b5",
    fullName: {
      fname: "THOMAS EMMANUEL",
      mname: "ROMERO",
      lname: "PAJARILLAGA",
    },
    role: "647dd209dced91b0b39444af", // Developer
    email: "dev@gmail.com",
    password: "password",
  },
  {
    _id: "647dd2a5dced91b0b39444b7",
    fullName: {
      fname: "EARLE",
      mname: "ROMERO",
      lname: "PAJARILLAGA",
    },
    role: "647dd209dced91b0b39444af", // Developer
    email: "dev.earle@gmail.com",
    password: "password",
  },
  {
    _id: "647dd2a5dced91b0b39444b8",
    fullName: {
      fname: "GABRIEL",
      mname: "ROMERO",
      lname: "PAJARILLAGA",
    },
    role: "647dd209dced91b0b39444af", // Developer
    email: "dev.gab@gmail.com",
    password: "password",
  },
  {
    _id: "647dd2a5dced91b0b39444b6",
    fullName: {
      fname: "ANGEL DENNISE",
      mname: "ROMERO",
      lname: "PAJARILLAGA",
    },
    role: "647dd9120874515a8fc47afb", // Client
    email: "client@gmail.com",
    password: "password",
  },
];

exports.users = (req, res) =>
  Entity.create(array)
    .then(response => {
      res.status(201).json({
        message: "Success",
        paylaod: response,
      });
    })
    .catch(err => res.status(400).json({ message: err.message }));
