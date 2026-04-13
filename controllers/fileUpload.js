const fs = require("fs");

exports.upload = (req, res) => {
  if (Array.isArray(req.body)) {
    const images = req.body;
    images.forEach((image) => {
      const { path, base64, name } = image;
      const url = `./assets/${path}`;

      if (!fs.existsSync(url)) {
        fs.mkdirSync(url, { recursive: true });
      }

      try {
        fs.writeFileSync(`${url}/${name}`, base64, "base64");
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    });

    return res.json({ message: "Files Uploaded Successfully" });
  } else {
    const { path, base64, name } = req.body;
    const url = `./assets/${path}`;

    if (!fs.existsSync(url)) {
      fs.mkdirSync(url, { recursive: true });
    }

    try {
      fs.writeFileSync(`${url}/${name}`, base64, "base64");
      return res.json({ message: "File Uploaded Successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};
