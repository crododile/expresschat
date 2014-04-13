App = {}
App.socket = io.connect()
App.usedNames = {}
App.name = "a new user"

App.id = 0

// Draw Function
App.draw = function(data) {
    if (data.type == "dragstart") {
        App.ctx.beginPath()
        App.ctx.moveTo(data.x,data.y)
    } else if (data.type == "drag") {
        App.ctx.lineTo(data.x,data.y)
        App.ctx.stroke()
    } else {
        App.ctx.stroke()
        App.ctx.closePath()
    }
}

// put chat messages in the dom
App.record = function(data){
	$('.chat-area').append(data + '<br>');
}

//list chatters
App.chatters = function(data){
	$('.chatters').html('')
	for( var id in data ){
		if ( id == App.id ){
			 $('.chatters').append(data[id] + " (you)" + '<br>')
		 }
		else{
			 $('.chatters').append(data[id] + '<br>')
		 }
		App.usedNames = data
	}
}

App.setId = function(data){
	if (App.id === 0){
		App.id = data
	}
}

$(window).bind('beforeunload', function(){
	App.socket.emit('leaving', App.id )
});

// Draw from other sockets
App.socket.on('draw', App.draw);
App.socket.on('message', App.record);
App.socket.on('connect', function(){
	$('.chat-area').html('')
	App.socket.emit('entered', App.name);
})

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
		data = { 'to' : $('.name').val(), 
		  'from' : App.name,
	       'num' : App.id }
		App.socket.emit('rename', data)
		App.name = $('.name').val()
	})
	
	$('.msg-btn').click(function(e){
		e.preventDefault();
		data = App.name + " : " + $('.msg').val();
		App.socket.emit('message', data);
	})
	

})





















