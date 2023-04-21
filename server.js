import express, { Router } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { readdirSync } from "fs";
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 7000;

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "https://facedook-lilac.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-type"],
  },
});

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    // useFindAndModify:false,
    useUnifiedTopology: true,
    // useCreateIndex:true,
  })
  .then(() => {
    http.listen(port);
    console.log(`app listening at http://localhost:${port}`);
  })
  .catch((err) => console.log("database connection error...", err));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://facedook-lilac.vercel.app"],
  })
);

readdirSync("./routes").map((route) => {
  console.log(route);
  app.use("/api", require(`./routes/${route}`));
});

io.on("connect", (socket) => {
  socket.on("new-post", (newPost) => {
    socket.broadcast.emit("new-post", newPost)
  })

  socket.on("new-message", (newMessage) => {
    socket.broadcast.emit("new-message", newMessage)
    // socket.emit("new-message", newMessage)

  })
})
