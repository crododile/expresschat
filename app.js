express = require('express.io')
_ = require('lodash')
app = express().http().io()

app.names = {}
app.users = 0

app.use(express.static('javascripts'))
app.use(express.static('stylesheets'))

// Broadcast all draw clicks.
app.io.route('drawClick', function(req) {
    req.io.broadcast('draw', req.data)
})

app.io.route('message', function(req){
	req.io.broadcast('message', req.data)
	req.io.emit('message', req.data)
})

app.io.route('draw', function(req){
	req.io.broadcast('cycloid', req.data)
	req.io.emit('cycloid', req.data)
})

app.io.route('entered', function(req){
	msg = req.data + " has arrived"
	req.io.broadcast('message', msg)
	app.users += 1
	app.names[req.io.socket.id] = req.data

	req.io.emit('chatters', app.names)
	req.io.broadcast('chatters', app.names)
})

app.io.route('rename', function(req){
	msg = req.data['from'] +' is now known as ' + req.data['to']
	app.names[req.data['num']] = req.data['to']
	req.io.emit('message', msg)
	req.io.emit('chatters', app.names)
	req.io.broadcast('message', msg)
	req.io.broadcast('chatters', app.names)
})

app.io.route('disconnect', function(req){
	app.users -= 1
	msg = app.names[req.io.socket.id] + " has left"
	delete app.names[req.io.socket.id]
	req.io.broadcast('message', msg)
	req.io.broadcast('chatters', app.names)
})

// Send client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
})

app.listen(process.env.PORT || 3000)