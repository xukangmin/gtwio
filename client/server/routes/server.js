import React from 'react';
import { renderToString } from 'react-dom/server';
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/hxmonitor.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/hxmonitor.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/hxmonitor.io/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const server = express();

var root_path = process.cwd().replace(/\\/g, '/');

var views_path = root_path + "/server/views/";
var public_path = root_path + "/server/public/";
// set the view engine to ejs
server.set('view engine', 'ejs');
server.set('views', views_path);
server.use(express.static(public_path, { dotfiles: 'allow' }));
// use res.render to load up an ejs view file

// index page
server.get('/*', (req, res) => {
//  const html = renderToString(<App />);
  // To Do: Server side render
  res.render('index',{});
});

const httpServer = http.createServer(server);
const httpsServer = https.createServer(credentials, server);

httpServer.listen(80, () => {
  console.log('Sever listening on port 80!');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
