const redisClient = require("../config/dbredis");

module.exports = (io, pool) => {
  // Handle Socket.IO connection
  io.on("connection", (socket) => {
    console.log("WS> New client connected:", socket.id);

    // When the user identifies themselves
    socket.on("identify", async (userId) => {
      await redisClient.hSet("WS-users", userId, socket.id);
      //   users[userId] = socket.id; // Map userId to socket ID
      //   console.log(users);
      console.log(`WS> User ${userId} connected with socket ID: ${socket.id}`);
    });

    // Handle chat message
    socket.on("chatMessage", async ({ sender, receiver, message }) => {
      // Insert message into database
      const query = `
                INSERT INTO messages (sender_id, receiver_id, message)
                VALUES ($1, $2, $3)
            `;
      await pool.query(query, [sender, receiver, message]);

      // Send the message to the receiver if they're online
      await redisClient.hGet("WS-users", receiver, (err, receiverSocketId) => {
        if (err) {
          console.error(`WS> ${err}`);
          throw new Error(err);
        }
        io.to(receiverSocketId).emit("chatMessage", { sender, message });
      });
    });

    // When the user disconnects
    socket.on("disconnect", async () => {
      console.log("WS> Client disconnected:", socket.id);
      let users = await redisClient.hGetAll("WS-users");
      for (let user in users) {
        let redisUserClientSocketID = await redisClient.hGet("WS-users", user);
        if (redisUserClientSocketID == socket.id) {
          await redisClient.hDel("WS-users", user);
          break;
        }
      }
    });
  });
};
