const fs = require("fs");
const path = require("path");
const { blue, green } = require("colorette");

const generateRoutes = (app, folder, src) => {
  // Read files and directories
  const files = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of files) {
    const file = entry.name;

    // Skip route generator files
    if (folder === "" && ["index.js", "index.cjs"].includes(file)) {
      continue;
    }

    // Recursively process directories only
    if (entry.isDirectory()) {
      generateRoutes(
        app,
        folder ? `${folder}/${file}` : file,
        path.join(src, file),
      );
      continue;
    }

    // Skip unsupported files
    if (!entry.isFile() || path.extname(file) !== ".js") {
      continue;
    }

    // For creating logs and API paths
    const formatPath = (api = false) => {
      if (!folder) return "";

      if (api) return `${folder}/`;

      return `[${folder.split("/").join("][")}]`;
    };

    const name = path.parse(file).name;
    const pathName = `./${folder ? `${folder}/` : ""}${file}`;

    // Register route
    app.use(`/api/${formatPath(true)}${name}`, require(pathName));

    // Log successful registration
    console.log(blue(`[Route]${formatPath()}[${file}] created successfully.`));
  }
};

module.exports = (app) => {
  generateRoutes(app, "", path.join(__dirname));
  console.log(green("[Routes] generated successfully."));
};
