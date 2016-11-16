var app = angular.module("selbo", ['angularGrid']); 
app.service('imageService',['$q','$http',function($q,$http){
        this.loadImages = function(){
            return $http.jsonp("https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=JSON_CALLBACK");
        };
    }]);
var commands=
	{
		"light_on" : {//turn on led 
			"cmd" : "led",
			"data" : "on"
		},
		"light_off" : {//turn off led
			"cmd" : "led",
			"data" : "off"
		},
		"pause_navigation" : { //stop navigation
			"cmd" : "nav",
			"data" : "pause"
		},
		"resume_navigation" : {//resume navigation
			"cmd" : "nav",
			"data" : "resume"
		},
		"capture_img" : {//take image, pause navigation is implicit 
			"cmd" : "camera",
			"data" : "capture"
		},
		"image_captured" : {//image captured notification
			"cmd" : "camera_status",
			"data" : "captured"
		},
		"immediate_capture" : { //capture image, no navigaton pause
			"cmd" : "camera",
			"data" : "immediate_capture"
		},
		"error" : { //report an error, use how ever you want
			"cmd" : "error",
			"data" : "your agent name"
		},
		"nav_paused" : { //navigation paused ack
			"cmd" : "nav_status",
			"data" : "paused"
		},
		"nav_resumed" : {//navigatino resumed ack
			"cmd" : "nav_status",
			"data" : "resumed"
		},
		"saved_img" : {//navigatino resumed ack
			"cmd" : "img_saved",
			"data" : "url of img"
		},
		"joystick_button" : {//joystick button click
			"cmd" : "joystick_button",
			"data" : "on"
		},
		"joystick_vertical" : {//joystick vertical move
			"cmd" : "img_saved",
			"data" : "value of vertical button"
		},
		"joystick_horizontal" : {//joystick horizontal move
			"cmd" : "img_saved",
			"data" : "value of horizontal button"
		},
	};
app.controller("slbo_ctrl",['$scope','$timeout','imageService', 'angularGridInstance',function($scope,$timeout,imageService,angularGridInstance) {
	$scope.heartbit_cycle=3000;
	$scope.reconnect_cycle=6000;
    $scope.host=window.location.hostname;
	$scope.ws_port=window.location.port-1; 
	$scope.connection=null;
	$scope.led_state="off";
	$scope.online=false; 
	$scope.nav="idle"; 
	imageService.loadImages().then(function(data){
            data.data.items.forEach(function(obj){
                var desc = obj.description,
                    width = desc.match(/width="(.*?)"/)[1],
                    height = desc.match(/height="(.*?)"/)[1];
                
                obj.actualHeight  = height;
                obj.actualWidth = width;
            });
           //$scope.pics = data.data.items;
           
        });
	$scope.pics=[];
	$scope.toggle_light=function(){
			if ($scope.led_state==null||$scope.led_state=="off")
			{
				$scope.send_command(commands.light_on.cmd,commands.light_on.data );
				return; 
			}
			if ($scope.led_state==null||$scope.led_state=="on")
			{
				$scope.send_command(commands.light_off.cmd,commands.light_off.data );
				return; 
			}
		}
	$scope.last_captured_img_url="http://"+window.location.host+"/photos/selbo.jpg";
	$scope.take_picture=function(){
		$scope.send_short(commands.capture_img);
	};
	$scope.toggle_nav=function(){
			if ($scope.nav=="idle")
			{
				$scope.send_command(commands.resume_navigation.cmd,commands.resume_navigation.data );
				return; 
			}
			if ($scope.nav=="active")
			{
				$scope.send_command(commands.pause_navigation.cmd,commands.pause_navigation.data );
				return; 
			}
		};
	$scope.full_screen=function()
	{
	
		var el=document.getElementById("main_img"),
		rfs = el.requestFullscreen
        || el.webkitRequestFullScreen
        || el.mozRequestFullScreen
        || el.msRequestFullscreen ;

		if (rfs)
			rfs.call(el);
		else alert("No full screen in this browser");
	};
	$scope.send_command=function(cmd,data)
	{
		$scope.connection.send(JSON.stringify({cmd:cmd,data:data}));
	};
	$scope.send_short=function(key_val)
	{
		$scope.connection.send(JSON.stringify({cmd:key_val['cmd'],data:key_val['data']}));
	};
	$scope.handle_new_img=function(img)
	{
		$scope.last_captured_img_url=img.url;
		tumb={};
		tumb.height=50;
		tumb.width=tumb.height*16/9;
		tumb.url=img.thumb;
		
		$scope.pics.push(tumb);
		$scope.$apply();
	};
	$scope.handle_message=function(msg)
	{
		switch (msg.cmd)
		{
			case "nav_status":
				switch(msg.data)
				{
					case "resumed":
						$scope.nav="active";
						break;
					case "paused":
						$scope.nav="idle"
						break; 
				}
				break
			case "led_status":
				switch(msg.data)
				{
					case "on":
						$scope.led_state="on";
						break;
					case "off":
						$scope.led_state="off";
						break; 
				}
				break;
			case "img_saved":
				$scope.handle_new_img(msg.data);
				break; 
		}
	}
	$scope.connect=function()
	{
		if ($scope.connection && ($scope.connection.readyState==1||$scope.connection.readyState==0))
			return; //already connected/ing. 
		if ($scope.connection && $scope.connection.readyState==2)
		{
			//busy closing, give some time before retry 
			$timeout($scope.connect,$scope.reconnect_cycle);
			return; 
		}
		var addr='ws://'+$scope.host+":"+$scope.ws_port; 
		console.log("Connecting to:"+addr);
		var connection = new WebSocket(addr);
		connection.onclose = function(){
			   $scope.online=false;
			   console.log('Connection closed');
			   $timeout($scope.connect,$scope.reconnect_cycle);
			}
		connection.onopen = function(){
		   /*Send a small message to the console once the connection is established */
		   console.log('Connection open!');
		   $scope.online=true; 
		}
		connection.onerror = function(error){
		   console.log('Error detected: ' + error);
		   //alert("Error "+error);
		}
		connection.onmessage = function(e){
		   var server_message = e.data;
		   console.log("Received:"+server_message);
		   try {
				msg=JSON.parse(server_message);
				$scope.handle_message(msg);
		   }
		   catch(err) {
				console.log( "Message error:"+ server_message)
			}	
		}
		$scope.connection=connection;
		$timeout($scope.connect,$scope.heartbit_cycle);
	}
	$scope.heartbit=function()
	{
		
		$timeout($scope.heartbit,$scope.heartbit_cycle);
	};
	$scope.init=function()
	{
		$scope.connect();
		$scope.heartbit();
	}
	$scope.init();
}]);