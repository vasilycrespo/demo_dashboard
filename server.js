var fs = require('fs');            
var path = require('path');
var express    = require('express');        
var app        = express();
var rest        = express();                   
var bodyParser = require('body-parser');  

//frontend-----------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8080;   
var router = express.Router();
app.use('/', express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.listen(port, '0.0.0.0');
console.log('frontend on port: '+port);

//restAPI-----------------------------------------
var messages_file = path.join(__dirname, 'scripts/messages.json');

rest.use(bodyParser.urlencoded({ extended: true }));
rest.use(bodyParser.json());

rest.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var port = process.env.PORT || 3030;  
var router_rest = express.Router();
// messages api
router_rest.get('/messages', function(req, res) {
  fs.readFile(messages_file, "utf-8", function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if(data){
      var messages = JSON.parse(data);
      for (var i=0, l = messages.length; i < l; i++) messages[i].timestamp = parseInt(messages[i].timestamp);
      res.json(messages);
    } else{
      res.json([]);
    }
  });
});
router_rest.post('/message', function(req, res) {
  var body = req.body || null;
  if (body === null) return res.status(409).json({ message: 'The provided data is not valid' });
  fs.readFile(messages_file, "utf-8", function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if(data){
      var db_messages = JSON.parse(data)
    } else{
      var db_messages = [];
    }
    db_messages.push(body)
    //write message
    fs.writeFile(messages_file, JSON.stringify(db_messages, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });
  res.json({message: "Data sucessfully added" });
});

//conections api
var connections_file = path.join(__dirname, 'scripts/connections.json');
router_rest.get('/connections', function(req, res) {
  fs.readFile(connections_file, "utf-8", function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if(data){
      var connections = JSON.parse(data);
      for (var i=0, l = connections.length; i < l; i++) connections[i].timestamp = parseInt(connections[i].timestamp);
      res.json(connections);
    } else{
      res.json([]);
    }
  });
});

router_rest.post('/connection', function(req, res) {
  var body = req.body || null;
  if (body === null) return res.status(409).json({ message: 'The provided data is not valid' });
  fs.readFile(connections_file, "utf-8", function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if(data){
      var db_connections = JSON.parse(data)
    } else{
      var db_connections = [];
    }
    db_connections.push(body)
    //write message
    fs.writeFile(connections_file, JSON.stringify(db_connections, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });
  res.json({message: "Data sucessfully added" });
});

rest.use('/api', router_rest);
rest.listen(port, '0.0.0.0');
console.log('restAPI started on port: '+port);

//Socket io real time comunication----------------
var chat = require('express')();
var server = require('http').createServer(chat);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Socket io listening at port %d', port);
});
var totalClients = 0;
var usersOnline = [];
io.on('connection', function (socket) {
  socket.emit('onuse', {
      usersOnline: usersOnline
    });
  var addedClient = false;
  socket.on('new_message', function (data) {
    socket.broadcast.emit('new_message', {
      autor: socket.username,
      message: data.message,
      timestamp: data.timestamp
    });
  });
  socket.on('new_client', function (username) {
    if (addedClient) return;
    socket.username = username;
    ++totalClients;
    usersOnline.push(username);
    addedClient = true;
    socket.emit('login', {
      totalClients: totalClients,
      usersOnline: usersOnline
    });
    socket.broadcast.emit('user_joined', {
      username: socket.username,
      totalClients: totalClients
    });
  });
  socket.on('is_writing', function () {
    socket.broadcast.emit('is_writing', {
      username: socket.username
    });
  });
  socket.on('disconnect', function () {
    if (addedClient) {
      --totalClients;
      for(var i=0, l= usersOnline.length; i<l; i++){
        if (usersOnline[i] === socket.username) usersOnline.splice(i,1);
      };
      socket.broadcast.emit('client_disconnected', {
        username: socket.username,
        totalClients: totalClients
      });
    }
  });
});
