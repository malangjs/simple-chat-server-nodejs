"use strict";
const path    = require('path');
const http    = require('http');
const faker   = require('faker');
const uuid    = require('uuid');
const express = require('express');
const io      = require('socket.io');

const app    = express();
const server = http.createServer(app);
const ws     = io(server);

app.use('/', express.static(path.join(__dirname, `client`)));

ws.on('connection', (socketClient) => {
	const initialClient = {
		name: faker.name.findName(),
		email: faker.internet.email(),
		avatar: faker.image.avatar(),
		uuid: uuid.v4()
	}

	socketClient.emit('connected', initialClient)
	socketClient.join('globalChat')

	socketClient.on('message', (message) => {
		console.log(message)
		const { senderName, text, avatar } = message;
		const messageId            = uuid.v4();
		const messageDate          = Date.now();

		ws.to('globalChat').emit('message', {senderName, text, messageDate, avatar, messageId});
	})
})


server.listen(3000, (err) => {
	if(err) throw err;
})