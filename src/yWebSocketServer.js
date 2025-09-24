import { setupWSConnection } from "y-websocket/bin/utils.js";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(1234, () => {
  console.log("Yjs WebSocket Server running on port 1234");
});
