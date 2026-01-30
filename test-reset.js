// Fix: Remove node-fetch dependency
const http = require('http');

const data = JSON.stringify({
    email: 'domtomconnect@gmail.com'
});

const options = {
    hostname: 'localhost',
    port: 5050,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Origin': 'http://localhost:5050'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
