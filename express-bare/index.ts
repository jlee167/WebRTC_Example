import express = require('express');
import { Request, Response, NextFunction } from 'express';
const app = express();
import fs = require('fs');
import os = require('os');
const httpServer = require('http').Server(app);
import cors = require('cors');
import SocketIO = require('socket.io');
const io = new SocketIO.Server(httpServer, {
  cors: {
    origin: process.env.HTTP_URL,
    methods: ["GET", "POST"]
  }
});





/* ------------------------------- Http Routes ------------------------------ */

app.get('/:filename', (req: Request, res: Response) => {

  let dirname : String;

  switch (getExtension(req.params.filename)) {
    case 'css':
      dirname = 'css';
      break;
    case 'html':
      dirname = 'views';
      break;
    case 'js':
      dirname = 'dist';
      break;
  }

  fs.readFile(`${dirname}/${req.params.filename}`, (err, data) => {
    if (err) {
      console.log(err);
      res.writeHead(404, {});
      res.end();
    } else {
      res.writeHead(200, {
      });
      res.write(data);
      res.end();
    }
  });
})


/* ---------------------------- WebSocket Routes ---------------------------- */

io.on('connection', (socket) => {

  console.log(`${socket.id} Connected `);


  socket.on('message', function(message) {
    console.log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });


  socket.on('create or join', function(room) {
    console.log('Received request to create or join room ' + room);

    let clientsInRoom = io.sockets.adapter.rooms[room];
    let numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    console.log('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
      socket.join(room);
      console.log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
    } else if (numClients === 1) {
      console.log('Client ID ' + socket.id + ' joined room ' + room);
      // io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready', room);
      socket.broadcast.emit('ready', room);
    } else { // max two clients
      socket.emit('full', room);
    }
  });


  socket.on('ipaddr', function() {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function(details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('disconnect', function(reason) {
    console.log(`Peer or server disconnected. Reason: ${reason}.`);
    socket.broadcast.emit('bye');
  });

  socket.on('bye', function(room) {
    console.log(`Peer said bye on room ${room}.`);
  });
  

});



httpServer.listen(3001, () => {
  console.log(`listening on *: 3001`);
});



/* ---------------------------- Helper Functions ---------------------------- */
function getExtension(filename: String) {
  return filename.split('.').pop();
}