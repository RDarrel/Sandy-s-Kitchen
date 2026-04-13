const { DECRYPT, ENCRYPT } = require("./secureData");

const bulkWrite = (req, res, Entity, message, action = "updateOne") => {
  let options = [];
  const container = DECRYPT(req.body.data);

  for (const index in container) {
    const item = container[index];

    options.push({
      [action]: {
        filter: { _id: item._id },
        update: { $set: { ...item } },
      },
    });
  }

  Entity.bulkWrite(options)
    .then(() => {
      res.json({
        success: message,
        payload: ENCRYPT(container),
      });
    })
    .catch((error) => res.status(400).json({ error: error.message }));
};

module.exports = bulkWrite;
