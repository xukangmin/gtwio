import express from 'express';
var path = require('path');
// import React from 'react';
// import { renderToString } from 'react-dom/server';

const server = express();

var root_path = process.cwd().replace(/\\/g, '/');

var public_path = root_path + "/server/public/";
// set the view engine to ejs
server.use(express.static(public_path));
// use res.render to load up an ejs view file

var path_index = path.join(public_path, 'index.html');
// index page
server.get('/*', (req, res) => {
//  const html = renderToString(<App />);
  // To Do: Server side render
  res.sendFile(path_index);
  //res.render('index',{});
});

server.listen(8001, () => {
  console.log('Sever listening on port ' + 8001);
});
