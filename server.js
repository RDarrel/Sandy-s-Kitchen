const http = require("http");
const { Server } = require("socket.io");
const { green, red } = require("colorette");
const app = require("./app");
const corsConfig = require("./config/corsConfig");
const connectDB = require("./config/db");
const syncExpiredBatches = require("./utilities/syncExpiredBatches");

const startServer = async () => {
  try {
    await connectDB();
    await syncExpiredBatches();

    require("./jobs/expirationJob");

    const server = http.createServer(app);

    require("./config/socket")(
      new Server(server, {
        cors: corsConfig,
      }),
    );

    const port = process.env.PORT || 5000;

    server.listen(port, () => {
      console.log(green(`[Server] running on port: ${port}`));
    });

    server.on("error", (error) => {
      console.log(red(`[Server] ${error.message}`));
    });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

startServer();
