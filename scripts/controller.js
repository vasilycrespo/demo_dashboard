var app = angular.module('myDashboard', []);

app.controller("dashboardCtrl", function($scope, $timeout, $interval, $animate, $http){
	//initial values
	$(".myDashboard").fadeIn("fast");
	$("bode").css({"background-color":"#755EBA"});
 	$scope.visitor = null;
 	$scope.base_url = "http://localhost";
 	$scope.messages = [];
 	$scope.connections = [];
 	$scope.onuse = [];
 	$scope.tools = false;
 	$scope.loged_out = false;
 	var socket = io.connect($scope.base_url+':3000');
 	//initial actions
 	$(".hello").addClass("show");
 	$scope.submit = function(e){
 		if(e.which === 13){
 			if($scope.visitor && $scope.visitor.length < 3) return $scope.trowError("That name is too short");
 			if(!/^[a-z\s]{3,55}$/ig.test($scope.visitor) || $scope.visitor === null ){
 				$scope.trowError("Please input a valid name");
 				return;
 			}
 			for(var i=0,l=$scope.onuse.length; i<l;i++) if($scope.onuse[i] === $scope.visitor){
 				$scope.trowError("That name is already in use");
 				return;
 			}
 			$scope.panel_animation();
 		};
 	};
	$scope.$watch('visitor', function() {
	   if($scope.visitor) $scope.visitor = $scope.visitor.replace(/[^a-z^\s]/gi, '');
	   if($scope.visitor && $scope.visitor.length > 35) $scope.visitor = $scope.visitor.slice(0, -1);
	});
	$scope.showTools = function(){
		$scope.tools = !$scope.tools;
		if($scope.tools){
			$(".toolbox_o").removeClass("toolbox_hide");
			$(".toolbox_o").addClass("toolbox_show");	
		}else{
			$(".toolbox_o").removeClass("toolbox_show");
			$(".toolbox_o").addClass("toolbox_hide");	
		}
	};
	$scope.showModal = function(i){
		console.log(i)
		$(".modal").fadeIn();
		switch(i) {
	    	case 1:
	        	$scope.modalTitle = "Graph: messages per minute ";
				$scope.modalDescription = "This graph shows all messages sent using the chat application located below. The plotting works in real time, so you can try sending new messages or wait till one minute has passed.";
	       		break;
	    	case 2:
		        $scope.modalTitle = "Users online";
				$scope.modalDescription = "The box shows all socket connections managed through socketIo  server. Try opening an incognito window, or open a session on one additional browser to test multiple connections.";
		        break;
	    	case 3:
	        	$scope.modalTitle = "Chat application";
				$scope.modalDescription = "The chat application is a multi-browser real time message application built with technologies such as, socketIo, Node, Express. All messages will be saved to a portable JSON file on this demo. Try opening additional session on different browser to try the chat!";
	       		break;
	    	case 4:
		        $scope.modalTitle = "Graph: onnections per minute";
				$scope.modalDescription = "Every time a visitor signs in the app, this graph will plot that event on real time.";
		        break;
		}
		console.log($scope.modalTitle)
	};
	$scope.hideModal = function(){
		$(".modal").fadeOut();
	};
	$scope.logout = function(){
		$(".head_menu").fadeOut("slow");
		$(".panel").removeClass("up");
		$(".panel").addClass("close");
		for(var i=0, l=$scope.online_user.length; i<l; i++) if($scope.online_user[i] === $scope.user) $scope.online_user.splice(i,1);
    	for(var i=0, l=$scope.onuse.length; i<l; i++) if($scope.onuse[i] === $scope.user) $scope.onuse.splice(i,1);
		$scope.visitor = null;
		$scope.user = undefined;
		socket.disconnect();
		$scope.loged_out =true;
	};
 	$scope.trowError = function(err){
 		$scope.error_form = err;
 				$(".error_box").addClass("start_error");
	 			$timeout( function(){ 
	 				$(".error_box").removeClass("start_error");
	 				$scope.error_form = "";
	 			}, 5000);
 				return;
 	}
 	$scope.panel_animation = function(argument) {
 			$(".panel").removeClass("close");
 		 	$("input.input_start").blur();
 			$(".panel").addClass("up");
 			$timeout( function(){ 
 				$(".head_menu").fadeIn(); 
 				$("body").css({"overflow-y":"auto"}); 
 			}, 2000);
 			$scope.user = $scope.visitor;
 			var con = {autor: $scope.user, "timestamp": new Date().getTime()};
 			$scope.postConnection(con);
 			$scope.connections.push(con);
 			if ($scope.loged_out){
 				 socket = io.connect($scope.base_url+':3000',{'forceNew':true });
 				 $scope.online_user.push($scope.user);
 			}
 			socket.emit('new_client', $scope.user);
 	}
 	$scope.update_time = function(){ $scope.now = new Date();  };
 	$interval($scope.update_time, 1000);
 	//get start data from rest api
 	$http({
	  method: 'GET',
	  url: $scope.base_url+':3030/api/messages'
	}).then(function successCallback(response) {
	    if(response.data){
	    	$scope.messages = response.data;
	    	$timeout( function(){ $(".chat_messages").scrollTop(300); }, 0);
	    }
	}, function errorCallback(response) {
	   alert("An error ocurred when conecting to the restapi");
	});
	$scope.postMessage = function(data){
	$http({
	    method: 'POST',
	    url: $scope.base_url+':3030/api/message',
	    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    transformRequest: function(obj) {
	        var str = [];
	        for(var p in obj)
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	        return str.join("&");
	    },
	    data: data
	}).then(function successCallback(response) {
	   response
	}, function errorCallback(response) {
	   alert("An error ocurred when posting the message to the restapi");
	});
	};
	//connections data from restapi
 	$http({
	  method: 'GET',
	  url: $scope.base_url+':3030/api/connections'
	}).then(function successCallback(response) {
	    if(response.data) $scope.connections = response.data;
	}, function errorCallback(response) {
	   alert("An error ocurred when conecting to the restapi");
	});
	$scope.postConnection = function(data){
	$http({
	    method: 'POST',
	    url: $scope.base_url+':3030/api/connection',
	    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    transformRequest: function(obj) {
	        var str = [];
	        for(var p in obj)
	        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	        return str.join("&");
	    },
	    data: data
	}).then(function successCallback(response) {}, function errorCallback(response) {
	   alert("An error ocurred when posting the connection to the restapi");
	});
	};
 	//chat functions
    socket.on('user_joined', function (data) {
    	if($scope.online_user !== false){
    		$scope.online_user.push(data.username);
    	}
    	$scope.onuse.push(data.username);
    	$scope.connections.push({autor: data.username, "timestamp": new Date().getTime()});
    });
    socket.on('client_disconnected', function (data) {
    	if($scope.online_user !== false){
    		for(var i=0, l=$scope.online_user.length; i<l; i++){
    			if($scope.online_user[i] === data.username) $scope.online_user.splice(i,1);
    		}
    	}
    	for(var i=0, l=$scope.onuse.length; i<l; i++) if($scope.onuse[i] === data.username) $scope.onuse.splice(i,1);
    });
    $scope.online_user = false;
    socket.on('login', function (data) {
        $scope.online_user = data.usersOnline;
    });
    socket.on('onuse', function (data) {
       $scope.onuse = data.usersOnline;
    });
    $scope.writing = function(e){
    	if(e.which === 13){
 			$scope.addMessage($scope.user,$scope.input_message);
 		} else {
	 		if($scope.input_message === undefined) return;
	    	if($scope.input_message.length >= 3){
	    		socket.emit("is_writing");
	    	};
 		}
    };
 	$scope.addMessage = function(autor,message,data){
 		if(message === undefined || message.length === 0 || message === "") return;
 		if(!data){
 			var message = {"autor": autor, "message": message, "timestamp": new Date().getTime() };
 			socket.emit('new_message', message);
 			$scope.postMessage(message);
 			$scope.input_message = "";
 		} else {
 			message = data;
 		}
 		$scope.messages.push(message);
 		$timeout( function(){ 
 			$(".chat_messages").scrollTop(300);
 		}, 0);
 	}
    socket.on('is_writing', function (data){
    	$scope.is_writing = true;
    	$scope.who_writes = data.username;
 		$timeout( function(){ $scope.is_writing = false; }, 2000);
    });
    socket.on('new_message', function (data){
    	$scope.addMessage(data.autor,data.message,data);
        $(".chat_messages").scrollTop(300);
    });
});

app.directive("graph", function($interval) {
  return {
    restrict: "E",
    transclude: true,
    scope: {
    	messages: '=?data',
    	title: "@?gTitle"
    },
    controller: function($scope, $element) {
    	//functions
		$scope.AmPm = function (date) {
	        var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
	        var am_pm = date.getHours() >= 12 ? "PM" : "AM";
	        hours = hours < 10 ? "0" + hours : hours;
	        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	        return hours+":"+minutes +" "+am_pm;;
    	}
    	$scope.addMessages = function(){
	    	for(var i = 0, l = $scope.x_axis.length, stamp_x, stamp_message; i < l; i++){
		    	for(var k = 0, v = $scope.messages.length; k < v; k++){
		    		stamp_x = new Date($scope.x_axis[i].timestamp).setSeconds(0,0,0);
		    		stamp_message = new Date($scope.messages[k].timestamp).setSeconds(0,0,0);
		    		if (stamp_x === stamp_message) {
		    			$scope.x_axis[i].count++;
		    		}
		    	}
	    	}
    	};
    	$scope.genYaxis = function(){
    		$scope.y_axis = [];
    		for(var i = 0, l = $scope.x_axis.length, big = 0; i < l; i++){
    			big = ($scope.x_axis[i].count > big)? $scope.x_axis[i].count : big;
	    	};
	    	if(big === 0) return false;
	    	var top = Math.ceil(big / 10) * 10;
	    	for(var i = 0, l = 6, substraction = 0; i < l; i++){
	    		substraction = i * (top / 5);
    			$scope.y_axis.push(top - substraction);
	    	};
    	};
    	$scope.getHeight = function(count){
    		var percent = (count/$scope.y_axis[0])*100, colour;
    		for(var i = 0, l = $scope.x_axis.length, big = 0; i < l; i++){
    			big = ($scope.x_axis[i].count > big)? $scope.x_axis[i].count : big;
	    	};
	    	var big = (count/big)*100, colour;
			if(big === 100){
				colour = "rgba(156,187,93,0.8)";
			} else if (big < 100 && percent > 50){
			 	colour = "rgba(187,179,93,0.8)";
			}
			else {
				colour = "rgba(187, 93, 93, 0.80)";
			}
    		return {"height": percent+"%", "background-color": colour};
    	};
    	$scope.pushToGraph = function(values){
    		if(values === null){
    			$scope.x_axis.shift();
	    		date = new Date();
	    		stamp =  date.getTime();
	    		data = {timestamp: stamp , ampm: $scope.AmPm(date), date: date, count: 0};
	    		$scope.x_axis.push(data);
    		};
    	}
    	$scope.update_minute = function(){
    	 $scope.now = new Date().getMinutes();  
    	};
    	$scope.showTip = function(event,action,text){
    			$scope.tip = action;
    			if($scope.tip){
    				$scope.tip_text = "Total: "+text.count;
    				$(".tip").css({"top":(event.pageY-$(window).scrollTop() + 4)+"px","left":(event.pageX+4)+"px"});
    			}
    	};
    	$scope.init = function(){
	    	//generating models
	    	$scope.griding_boxes = new Array();
	    	for(var i = 0, l = 50; i < l; i++){
	    		$scope.griding_boxes.push(i);
	    	}
	    	//build x Axis 
	    	$scope.currentdate = new Date();
	    	$scope.x_axis = [];
	    	for(var i = 0, l = 10, data, stamp, date; i < l; i++){
	    		stamp = $scope.currentdate.getTime()-(i * 60 * 1000)
	    		date = new Date(stamp)
	    		data = {timestamp: stamp , ampm: $scope.AmPm(date), date: date, count: 0}
	    		$scope.x_axis.unshift(data)
	    	}
    		$scope.addMessages();
    		$scope.genYaxis();
    		$interval($scope.update_minute, 1000);
    	};
     	$scope.$watch('now', function(newVal, oldVal){
		    if(newVal && oldVal){
		    	$scope.pushToGraph(null)
		    }
		}, true);
    	$scope.$watch('messages', function(newVal, oldVal){
		    if(newVal && oldVal){
		    	$scope.init();
		    }
		}, true);
    },
    template:
      '<div class="graph_box">'+
      	'<div class="tip" ng-show="tip"><span class="fn_b">{{tip_text}}</span></div>'+
      	'<div class="side">' + 
      		'<div class="box" ng-repeat="b in y_axis"><span class="fn_b">{{b}}</span></div>' +
      	'</div>'+
      	'<div class="center">' +
      		'<div class="griding">' +
      			'<div class="box" ng-repeat="b in griding_boxes"></div>' +
      			'<div class="box-bottom" ng-repeat="b in x_axis"><span class="fn_s">{{b.ampm}}</span></div>' +
      		'</div>'+
      		'<div class="graphic">' +
      			'<div class="no_messages" ng-show="messages.length == 0">'+
					'<span class="fn_b">No data to plot yet</span>'+
				'</div>'+
      			'<div class="title_graph" ng-show="title">'+
					'<span class="fn_b">{{title}}</span>'+
				'</div>'+
      			'<div class="box" ng-repeat="c in x_axis">'+
      				'<div class="collum" ng-style="getHeight(c.count)" ng-mousemove="showTip($event,true,c)" ng-mouseleave="showTip($event,false)"></div>'+
      			'</div>'+  
      		'</div>'+
      	'</div>'+
      '</div>',
    replace: true
  };
});

String.prototype.replaceAt=function(index, character) {
	character = String(character);
    return this.substr(0, index) + character + this.substr(index+character.length);
}
