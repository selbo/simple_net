console.log("Hi google node");
var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express();
var url = require('url');
var stringify = require('json-stringify-safe');
var TinyURL = require('tinyurl');
var fs = require('fs');
path=require('path');
var config = require('./config.json');
var gm = require('gm');
var Jimp = require("jimp");

var http_app = express();
http_app.use("/static",express.static(__dirname + '/static'));
http_app.use("/photos",express.static(__dirname + '/photos'));
http_app.use("/semantic",express.static(__dirname + '/semantic'));

var bodyParser = require('body-parser');
http_app.use(bodyParser.json()); // support json encoded bodies
http_app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); // support encoded bodies


http_app.get('/', function (req, res) {
   res.send('Hello World');
})

http_app.get('/api/capture', function(req, res) {
    res.send("Not supported");
});
//d
var ws_port=config.ws_port;
var http_port=ws_port+1;
var host=config.host
var server_http_addr="http://"+host+":"+http_port;
var photos_http_addr=server_http_addr+"/photos/";
http_app.post('/api/capture', function(req, res) {
    var img = req.body.img;
    var timestamp = req.body.timestamp;
	if (typeof(timestamp)=="undefined")
		timestamp=Date.now();
	console.log("Upload timestamp:%s",timestamp);
	var image_file_name=timestamp+'.jpg';
	org_path=path.join("photos","org",image_file_name);
	thumb_path=path.join("photos","thumb",image_file_name);
	img_path=path.join("photos",image_file_name);
	console.log("recieved file at %s, writing to:%s", timestamp,org_path);
	var wstream = fs.createWriteStream(org_path);
	// creates random Buffer of 100 bytes
	var buffer = Buffer.from(img, 'base64');
	wstream.write(buffer);
	wstream.end();
	var rotation=0;
	Jimp.read(org_path, function (err, rotated) {
		if (err) throw err;
		rotated.rotate(rotation).write(img_path); // save
		Jimp.read(img_path, function (err, thumb) {
			if (err) throw err;
			thumb.resize(100, 100).write(thumb_path); // save
		});
	});
	
	//fs.writeFileSync(img_path, buffer);
	//gm(img_path).rotate(0, 180);
	//gm(img_path).thumb(100, 100, thumb_path, 100,function(err, stdout, stderr, command){});
	console.log("rotated:%s, thumb:%s", img_path,thumb_path);
	
	var img_url=photos_http_addr+image_file_name;
	var img_thumb_url=photos_http_addr+"thumb/"+image_file_name;
	r={};
	r.status="OK";
	r.url_full=img_url;
	
	TinyURL.shorten(img_url, function(short) {
		console.log(short);
		r.url_short=short;
		res.send(r);
		json={};
		json.id=timestamp;
		json.url=short;
		json.thumb=img_thumb_url;
		send("img_saved",json);
	});
    
});

var http_server = http_app.listen(http_port, function () {
   var host = http_server.address().address
   var port = http_server.address().port
   
   console.log("HTTP app listening at http://%s:%s(%s)", host, http_port,ws_port)
})


var server = http.createServer(app);
server.listen(ws_port);

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
    ws.send("Welcome");
});
wss.on('close', function() {
    console.log('stopping client interval');
    clearInterval(id);
  });


/*app.use(function (req, res) {
  res.send({ msg: "hello" });
});*/

function handle_message(cmd,data)
{
	console.log("command:"+cmd+",data:"+data);
}

wss.on('connection', function connection(ws) {
  
  var location = url.parse(ws.upgradeReq.url, true);
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312
  console.log("connected");
  ws.on('message', function incoming(message) {
    console.log('received: %s by %s', message,ws);
	try {
          	
			wss.clients.forEach(function each(client) {
					if (client==ws)
					{
						//console.log("Skipping receiver"); 
						//return; 
					}
					console.log ("Sending to:"+client+", message:"+message);  
					client.send(message);
			});
			json=JSON.parse(message);
        	handle_message(json.cmd,json.data);
        }
	catch(err) {
		console.log( err.message);
		var stack = new Error().stack
		console.log( stack )
	}	
  });
  con_params={};
  var server=server_http_addr;
  var photos_url_template=photos_http_addr+"<time_stamp>.jpg";
  con_params.cmd="photo_template";
  con_params.data=photos_url_template;
  ws.send(JSON.stringify(con_params));
});

function send(cmd,data)
{
	wss.clients.forEach(function each(client) {
		try {
			client.send(JSON.stringify({cmd:cmd,data:data}));
		}
		catch(err){
			return; 
		}
	});
}
/*
server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
*/
