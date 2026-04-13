const { green, blue } = require("colorette");

const socket = (io) =>
  io.on("connection", (stream) => {
    console.log(green("[Socket.IO] connection established successfully."));
    console.log(blue(`[${stream.id}] connected to socket.`));

    stream.on("join_room", (room) => stream.join(room));

    stream.on("logout", (roomId) => stream.to(roomId).emit("logout"));

    stream.on("send_message", (data) => {
      io.emit("receive_message", data);
    });

    stream.on("send_seenMessages", (data) => {
      io.emit("receive_seenMessages", data);
    });

    stream.on("send_updateOldMsg", (data) => {
      io.emit("receive_updateOldMsg", data);
    });

    stream.on("send_isTyping", (data) => {
      stream.broadcast.emit("receive_isTyping", data);
    });

    stream.emit("me", stream.id);
  });

module.exports = socket;
