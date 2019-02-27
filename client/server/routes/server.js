import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

const server = express();

var root_path = process.cwd().replace(/\\/g, '/');

var views_path = root_path + "/server/views/";
var public_path = root_path + "/server/public/";
// set the view engine to ejs
server.set('view engine', 'ejs');
server.set('views', views_path);
server.use(express.static(public_path));
// use res.render to load up an ejs view file

// index page
server.get('/*', (req, res) => {
//  const html = renderToString(<App />);
  // To Do: Server side render
  res.render('index',{});
});

server.listen(process.env.APP_PORT, () => {
  console.log('Sever listening on port ' + process.env.APP_PORT);
});
