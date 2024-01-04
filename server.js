/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
                                                         //or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from
const MIME_TYPES = {
  'css': 'text/css',
  'gif': 'image/gif',
  'htm': 'text/html',
  'html': 'text/html',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'svg': 'image/svg+xml',
  'txt': 'text/plain'
}
let connectedSockets = new Map()//map of all connected sockets (associates socket id with socket name attribute)
let onPing = false//tells us if we are referring to one or more sockets

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
  //handler for http server requests including static files
  let urlObj = url.parse(request.url, true, false)
  console.log('\n============================')
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let filePath = ROOT_DIR + urlObj.pathname
  if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

  fs.readFile(filePath, function(err, data) {
    if (err) {
      //report error to console
      console.log('ERROR: ' + JSON.stringify(err))
      //respond with not found 404 to client
      response.writeHead(404);
      response.end(JSON.stringify(err))
      return
    }
    response.writeHead(200, {
      'Content-Type': get_mime(filePath)
    })
    response.end(data)
  })

}

//Socket Server
io.on('connection', function(socket) {
  console.log('client connected')
  //console.dir(socket)

  socket.emit('serverSays', 'You are connected to CHAT SERVER')

  socket.on('clientSays', function(data) {
    console.log('RECEIVED: ' + data)
    socket.join("chatRoom")
    io.emit('serverSays', data)
  })

  //sets socket name and initializes the Map of the connected socket
  socket.on('clientName', function(name){
    socket.name = name
    connectedSockets.set(name, socket.id)
  })

  //emits to a specific socket if the name in the received message happens to start with a sockets name
  socket.on('onPing', function(nameArray,message){
    for(let key of connectedSockets.keys()){
      for(let name of nameArray){
        if(name === key){
          onPing = true
          let socketID = connectedSockets.get(name)
          io.to(socketID).emit('pingSays', message)
        }
      }
    }
  })

  //takes care of broadcasting to everyone except the sender
  socket.on('roomMessage', function(message){
    if(onPing != true){
      socket.broadcast.to('chatRoom').emit('serverSays',  socket.name + ": " + message)//broadcast to everyone except the sender
    }
  })

  //takes care of braodcasting to specific sockets
  socket.on('privateMessage', function(message){
    if(onPing != true){
    socket.emit('senderSays',  socket.name + ": " + message)//broadcast to just the sender
    }else{
      socket.emit('pingSays',  socket.name + ": " + message)//broadcast to just the sender
      onPing = false
    }
  })

  socket.on('disconnect', function(data) {
    //event emitted when a client disconnects
    console.log('client disconnected')
  })
})


console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)
