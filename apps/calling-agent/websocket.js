import { WebSocketServer } from 'ws';
import http from 'http';

// ----------------------------------------------------
// 1. Setup HTTP Server and WebSocket Server
// ----------------------------------------------------
const port = 3000;
const wssPath = '/llm-websocket/'; // The path Retell will connect to

// Create a basic HTTP server
const server = http.createServer((req, res) => {
    // This part handles regular HTTP requests (like your root '/')
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World! (HTTP Server Running)');
    } else {
        res.writeHead(404);
        res.end();
    }
});

// Create the WebSocket Server instance, but tell it NOT to listen on its own port
const wss = new WebSocketServer({ noServer: true });

// Handle regular HTTP requests being UPGRADED to a WebSocket connection
server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);

    // **CRITICAL STEP: Only upgrade the connection on the correct path**
    if (pathname.startsWith(wssPath)) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            // The path parameters (like :call_id) are not automatically parsed
            // in raw Node.js. You would parse them from 'pathname' if needed.
            const callId = pathname.split('/').pop(); 
            
            console.log(`WebSocket connected for call ID: ${callId}`);
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy(); // Reject other upgrade requests
    }
});

// ----------------------------------------------------
// 2. Implement the Retell LLM WebSocket Protocol
// ----------------------------------------------------
wss.on('connection', (ws, req) => {
    // Retell expects your server to send the first message, typically an empty response, 
    // to allow the user to speak first.
    ws.send(JSON.stringify({
        response_type: 'response',
        content: '',
        end_call: false,
    }));
    
    ws.on('error', (err) => {
        console.error('Error received in LLM websocket client:', err);
    });

    ws.on('message', (data, isBinary) => {
        // Retell server will send transcript from caller along with other information
        try {
            const request = JSON.parse(data.toString());
            
            if (request.interaction_type === "update_only") {
                // *** LIVE TRANSCRIPT IS HERE ***
                const fullTranscript = request.transcript;
                const latestUtterance = fullTranscript[fullTranscript.length - 1];

                if (latestUtterance && latestUtterance.content) {
                    console.log(`[LIVE TRANSCRIPT] ${latestUtterance.role}: ${latestUtterance.content}`);
                }
                
                // Do NOT send a response back for update_only
            } else if (request.interaction_type === "response_required") {
                console.log(`[RESPONSE REQUIRED] Latest Transcript: ${request.transcript.map(t => t.content).join(' ')}`);
                
                // *** Agent logic goes here ***
                // For demonstration, send a simple canned response
                ws.send(JSON.stringify({
                    response_type: 'response',
                    content: 'I received your message. What else can I help you with?',
                    end_call: false,
                }));
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason.toString()}`);
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Node.js HTTP/WebSocket server listening on port ${port}`);
    console.log(`WebSocket path: ws://localhost:${port}${wssPath}<call_id>`);
});