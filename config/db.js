const mongoose = require("mongoose");
const { red, green } = require("colorette");

const connectToDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    if (mongoose.connection.readyState === 1) {
      return true;
    }

    await mongoose.connect(process.env.ATLAS_URI);

    console.log(green("[MongoDB] Connection established successfully."));

    return true;
  } catch (err) {
    console.error(red("[MongoDB] Connection failed."));
    console.error(err);

    throw err;
  }
};

module.exports = connectToDB;
