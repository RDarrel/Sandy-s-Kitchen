const Credentials = require("../models/student/credentials");

const getLRN = async (student) => {
  const credential = await Credentials.findOne({ student });
  return credential.LRN;
};

module.exports = getLRN;
