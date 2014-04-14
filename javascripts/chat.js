
App = {}
App.socket = io.connect()
App.usedNames = {}
App.name = "a new user"
App.room = "Commons"

// Draw Function
App.draw = function(data) {
    if (data.type == "dragstart") {
        App.ctx.beginPath()
        App.ctx.moveTo(data.x,data.y)
    } else if (data.type == "drag") {
        App.ctx.lineTo(data.x,data.y)
        App.ctx.stroke()
		console.log(data.x)
    } else {
        App.ctx.stroke()
        App.ctx.closePath()
    }
}

// put chat messages in the dom
App.record = function(data){
	if (data.room) {
		if (data.room != App.room) return
		data = data.msg
	}
	$('.chat-area').append(data + '<br>');
}

//list chatters
App.chatters = function(data){
	$('.chatters').html('')
	for( var id in data ){
		if ( id === App.id  ){
			 $('.chatters').append(data[id][0] + " (you)" + '<br>')
		 }
		else{
			if(data[id][1] === App.room )
			 $('.chatters').append(data[id][0] + '<br>')
		 }
		App.usedNames = data
	}
}

App.setId = function(data){
	if (App.id === 0){
		App.id = data
	}
}

App.cycloid = function(data){

    App.ctx.fillStyle = "black";
       
	   radius = 30;
	   centerX= 20;
	   homeX = 20;
	   centerY = 40;
	   degTick = 0;
	   windPoints = []
	   App.ctx.beginPath();
	  var rollin = setInterval(function(){ 
	
	   	leadingX = centerX + radius * Math.cos( (1/2)*Math.PI + degTick * ( 2 * Math.PI) );
	   	leadingY = centerY + radius * Math.sin( (1/2)*Math.PI + degTick * ( 2 * Math.PI) );
			  console.log(leadingX, leadingY)
	   	windPoints.push( [ leadingX, leadingY ] )


	   	for( var i = 0; i < windPoints.length; i++ ){
	   		App.ctx.fillRect( windPoints[i][0] , windPoints[i][1], 20, 1 );
	   		if ( i % 5 === 0 ) App.ctx.fillStyle = 'blue';
	   		else if ( i % 4 === 0 ) App.ctx.fillStyle = 'green';
	   		else App.ctx.fillStyle = 'red'
	   	}

	   	App.ctx.fillStyle = 'red'

	   	line = ( 1 - degTick ) * ( 2 * Math.PI * radius );

	   	App.ctx.fillRect( leadingX, leadingY, 20, 2 );

	   	degTick += 0.05;
        centerX = homeX + ( degTick * (2 * Math.PI * radius ) );
	   	App.ctx.stroke()
		if (centerX > 1360) clearInterval(rollin)
   }, 60)
	
}

// Draw from other sockets
App.socket.on('draw', App.draw);
App.socket.on('message',  App.record );
App.socket.on('connect', function(){
	$('.chat-area').html('')
	App.id = App.socket.socket.sessionid
	App.socket.emit('entered',{'name': App.name, "room":App.room});
})

App.socket.on('cycloid', App.cycloid);

App.socket.on('sendId', App.setId);

App.socket.on('chatters', App.chatters);

// Bind click and drag events to drawing and sockets.
$(function() {
    App.ctx = $('canvas')[0].getContext("2d")
    $('canvas').live('drag dragstart dragend', function(e) {
        offset = $(this).offset()
        data = {
            x: (e.clientX - offset.left),
            y: (e.clientY - offset.top),
            type: e.handleObj.type
        }
        App.draw(data) // Draw yourself.
        App.socket.emit('drawClick', data) // Broadcast draw.
    })
	
	$('.name-btn').click(function(e){
		e.preventDefault();
		for ( id in App.usedNames){
			if ( $('.name').val() === App.usedNames[id]){
				alert('that name is already in use, pick another')
				return
			}
		}
		data = { 'to' : _.escape($('.name').val()), 
		  'from' : App.name,
	       'num' : App.id }
		App.socket.emit('rename', data)
		App.name = $('.name').val()
	})
	
	$('.msg-btn').click(function(e){
		e.preventDefault();

		if( $('.msg').val() == "d(cycloid)" ){

			App.socket.emit('draw', 'd(cycloid)' )
		}
		msg = _.escape(App.name + " : " + $('.msg').val());
		App.socket.emit('message', {'msg':msg, 'room':App.room});
		$('.msg').val('')
	})
	
	$('.room-btn').click(function(e){
		e.preventDefault();
		App.socket.emit('leave', {'name':App.name, 'room':App.room})
		App.room = e.target.textContent
		App.socket.emit('entered', {'name':App.name, 'room':App.room})
		$('.chat-area').append('welcome to ' + App.room + '<br>')
		$('.room-name').text(App.room)
	})
	
	$('.cycloid').click(function(e){
		e.preventDefault();
		App.socket.emit('draw', 'd(cycloid)' )
	})
	
	$('.erase').click(function(e){
		e.preventDefault();
		var canvas = $('canvas')[0]
		canvas.getContext('2d').clearRect(0,0, canvas.width, canvas.height );
	})
	
	var progress = setInterval(function() {
	    var $bar = $('.progress-bar');
    
	    if ($bar.width()==700) {
	        clearInterval(progress);
	        $('.progress').removeClass('active');
	    } else {
	        $bar.width($bar.width()+50);
	    }
		
	    $bar.text("loading...");
	}, 700);
	

})





















