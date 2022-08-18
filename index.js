'use strict';

const express = require('express')
const router = express.Router()
const path = require('path')
const app = express()
const port = process.env.PORT
const http = require('http');
const serverX = http.createServer(app);
let myip ="";

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('IP locale : ' + add);
    myip = add;
})

let dns = require('native-dns');
let server = dns.createServer();

server.on('listening', () => console.log('DNS server listening on', server.address()));
server.on('close', () => console.log('server closed', server.address()));
server.on('error', (err, buff, req, res) => console.error(err.stack));
server.on('socketError', (err, socket) => console.error(err));

let authority = { address: '8.8.8.8', port: 53, type: 'udp' };

function proxy(question, response, cb) {
  console.log('proxying', question.name);

  var request = dns.Request({
    question: question, // forwarding the question
    server: authority,  // this is the DNS server we are asking
    timeout: 1000
  });

  // when we get answers, append them to the response
  request.on('message', (err, msg) => {
    msg.answer.forEach(a => response.answer.push(a));
  });

  request.on('end', cb);
  request.send();
}

let async = require('async');

let entries = [
    {
      domain: "conntest.nintendowifi.net",
      records: [
        { type: "A", address: myip, ttl: 1800 }
      ]
    },
    {
      domain: "ctest.cdn.nintendo.net",
      records: [
        { type: "A", address: myip, ttl: 1800 }
      ]
    }
  ];
  
  function handleRequest(request, response) {
    console.log('request from', request.address.address, 'for', request.question[0].name);
  
    let f = [];
  
    request.question.forEach(question => {
      let entry = entries.filter(r => new RegExp(r.domain, 'i').exec(question.name));
      if (entry.length) {
        entry[0].records.forEach(record => {
          record.name = question.name;
          record.ttl = record.ttl || 1800;
          record.address = myip;
          response.answer.push(dns[record.type](record));
        });
      } else {
        f.push(cb => proxy(question, response, cb));
      }
    });
    async.parallel(f, function() { response.send(); });
  }

server.on('request', handleRequest);

server.serve(53);

app.use(express.static('public')); 
app.use('/images', express.static('images'));

app.use(function(req, res, next) {
    res.setHeader('Content-Security-Policy', "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'; frame-src *; X-Organization");
    next();
  });
  
  app.all('/', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("X-Organization");
      next();
  });

  app.use("/", router);

  app.get('/', (req, res) => {
    res.sendFile((path.join(__dirname+'/index.html')))
  })

serverX.listen(80, () => {
    console.log(`Web Server listening on 127.0.0.1, port 80`)
  })