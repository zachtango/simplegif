const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    
    let filePath = path.join(`${__dirname}/../client/build`, req.url);
    
    // If the request is for the root path, serve the index.html file
    if (req.url === '/') {
        filePath = path.join(`${__dirname}/../client/build`, 'index.html');
    }
    
    // Determine the appropriate MIME type based on the file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        // Add more cases as needed for other file types
        case '.webm':
            contentType = 'video/webm';
            break;
        case '.ico':
            contentType ='image/png';
            break;
        default:
            break;
    }
    
    // Read the file content
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) {
            res.statusCode = 500;
            res.end('Error reading file');
            return;
        }
    
        // Set the response headers
        res.setHeader('Content-Type', contentType);
    
        // Send the file content as the response body
        res.end(content);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});