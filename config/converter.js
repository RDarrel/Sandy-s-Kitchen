const { default: mongoose } = require("mongoose");

const strToObjId = (stringIds) => {
  const parsedIds = JSON.parse(stringIds);
  if (Array.isArray(parsedIds)) {
    return JSON.parse(stringIds).map((batchId) =>
      mongoose.Types.ObjectId(batchId)
    );
  } else {
    return mongoose.Types.ObjectId(stringIds);
  }
};

module.exports = strToObjId;
