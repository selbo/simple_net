var myApp = angular.module('myApp', []);

//Model
var Cow = (function(){
    function Cow(){
        this.ateGrass = 0;
    }
    Cow.prototype.eatGrass = function(){
        var isAlive = false;
        if(this.ateGrass < 4){
            this.ateGrass += 1;
            isAlive = true;
        }
        return isAlive;
    }
    return Cow;
})();

//Module(Service)
myApp.service('farmService', function() {
    this.ateGrassTotal = 0;
    this.evalFarm = function(times,cows) {
        var grass = times - this.ateGrassTotal;
        var newCows = [];
        for(var i = 0;i < cows.length; i++){
            if(cows[i].eatGrass()){
                grass -= 1;
                this.ateGrassTotal += 1;
                newCows.push(cows[i]);
            }
        }
        return {grass:grass,cows:newCows}
    };
});

//Controller
myApp.controller("MainController",function($scope, $timeout,farmService){
    $scope.times = 0;
    $scope.grass = [];
    $scope.cows = [];
    $scope.onTimeout = function(){
        $scope.times += 1;
        var farm = farmService.evalFarm($scope.times,$scope.cows);
        $scope.grass = [];
        for(var i = 0 ; i < farm.grass;i++){ $scope.grass.push(i); }
        $scope.cows = farm.cows;
        myTimer = $timeout($scope.onTimeout,1000);
    }
    $scope.ws = new WebSocket("ws://130.211.184.58:8000");
    //ws = new WebSocket("ws://localhost:8000");
    console.log("Hello debugger");
    /*ws.onmessage = function (evt)
       {
          var received_msg = evt.data;
          alert("Message is received..."+received_msg);
       };*/
    //var myTimer = $timeout($scope.onTimeout,1000);
    $scope.command=null;
    $scope.data=null;
    $scope.stop = function(){
        $timeout.cancel(myTimer);
    }
    $scope.buyCow = function(){
        $scope.cows.push(new Cow());
    }

    $scope.SendCommand=function()
    {
        obj={};
        obj.cmd=$scope.command;
        obj.data=$scope.data;
        $scope.ws.send(JSON.stringify(obj));
    }
});
