console.log("Hi google node");
var server = require('http').createServer()
  , url = require('url')
  , WebSocketServer = require('ws').Server
  //, wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 8000;
var path = require('path');

app.use('/static',express.static(path.join(__dirname, 'static')));
/*app.use(function (req, res) {
  res.send({ msg: "hello" });
});*/

function handle_message(cmd,data)
{
	console.log("command:"+cmd+",data:"+data);
}

/*wss.on('connection', function connection(ws) {
  
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312
  console.log("connected");
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
	try {
          	json=JSON.parse(message);
        	handle_message(json.cmd,json.data);
		wss.clients.forEach(function each(client) {
    			client.send(data);
  		});
        }
catch(err) {
    console.log( err.message);
}
  });

  ws.send('something');
});*/

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
