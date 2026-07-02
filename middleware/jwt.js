const jwt = require("jsonwebtoken"),
  Users = require("../models/persons/Users");

const verifyToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    }),
  );

exports.validate = (req, res, proceed) => {
  const token = req.cookies.token;
  const { authorization } = req.headers;
  console.log("token", token);
  if (!token)
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication token is missing or invalid.",
    });

  // if (!authorization.startsWith(process.env.JWT_HEADER))
  //   return res.status(400).json({
  //     error: "Invalid Token",
  //     message: "The provided token is not in the correct format.",
  //   });

  verifyToken(token)
    .then((response) =>
      Users.findById(response._id)
        .select("-password")
        .populate({
          path: "role",
          select: "-__v -createdAt -updatedAt -_id",
        })
        .then((user) => {
          // when the _id did not match anything
          if (!user)
            return res.status(404).json({
              error: "User Not Found",
              message: "The provided Credentials does not exist.",
            });

          res.locals.caller = user;
          proceed();
        })
        // when the token has invalid _id format
        .catch(() =>
          res.status(403).json({
            error: "Invalid Token",
            message: "The provided token contains invalid information.",
          }),
        ),
    )
    //when the token is expired or invalid
    .catch(() =>
      res.status(403).json({
        error: "Invalid Token",
        message: "The provided token is either invalid or expired.",
      }),
    );
};

exports.notFound = (req, res, proceed) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(400);
  proceed(error);
};

exports.errorHandler = (err, req, res, proceed) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
