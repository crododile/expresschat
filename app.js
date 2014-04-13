express = require('express.io')
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

app.io.route('entered', function(req){
	msg = req.data + " has arrived"
	req.io.broadcast('message', msg)
	app.users += 1
	app.names[app.users] = req.data
	req.io.emit('sendId', app.users)
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

app.io.route('leaving', function(req){
	msg = app.names[req.data] + " has left"
	delete app.names[req.data]
	req.io.broadcast('message', msg)
	req.io.broadcast('chatters', app.names)
})

// Send client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
})

app.listen(3000)