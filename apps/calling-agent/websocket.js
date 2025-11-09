import { WebSocketServer } from 'ws';
import http from 'http';
import OpenAI from 'openai'; // Import the OpenAI SDK
import 'dotenv/config'; 

// --- Configuration for External LLM ---
// Use environment variables for security
const LLM_API_KEY = process.env.NVIDIA_API_KEY; 
const LLM_ENDPOINT = 'https://integrate.api.nvidia.com/v1'; 
const LLM_MODEL = 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
const SYSTEM_PROMPT = "You are a helpful and conversational AI agent for Retell AI. Keep your responses concise and human-like, ideally under 10 words, and always listen carefully.";

// Initialize the OpenAI client for NVIDIA API Catalog
const openai = new OpenAI({
    apiKey: LLM_API_KEY,
    baseURL: LLM_ENDPOINT,
});

// ----------------------------------------------------
// 1. Setup HTTP Server and WebSocket Server (Unchanged)
// ----------------------------------------------------
const port = 3000;
const wssPath = '/llm-websocket/'; 

// Create a basic HTTP server (omitted for brevity, assume it's the same)
const server = http.createServer((req, res) => { /* ... */ });
const wss = new WebSocketServer({ noServer: true });

// Handle regular HTTP requests being UPGRADED to a WebSocket connection
server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);
    
    console.log(`[UPGRADE ATTEMPT] Path: ${pathname}`); // NEW LOG
    
    // **CRITICAL STEP: Only upgrade the connection on the correct path**
    if (pathname.startsWith(wssPath)) {
        console.log('[UPGRADE SUCCESS] Handing off to WebSocket server.'); // NEW LOG
        wss.handleUpgrade(request, socket, head, (ws) => {
            const callId = pathname.split('/').pop(); 
            
            console.log(`WebSocket connected for call ID: ${callId}`);
            wss.emit('connection', ws, request);
        });
    } else {
        console.log(`[UPGRADE REJECTED] Path does not start with ${wssPath}. Destroying socket.`); // NEW LOG
        socket.destroy(); // Reject other upgrade requests
    }
});

// ----------------------------------------------------
// 2. Implement the Retell LLM WebSocket Protocol (Streaming Logic)
// ----------------------------------------------------
wss.on('connection', (ws, req) => {
    // Initial message to allow the user to speak first.
    ws.send(JSON.stringify({
        response_type: 'response',
        content: '', 
        end_call: false,
    }));
    
    ws.on('error', (err) => {
        console.error('Error received in LLM websocket client:', err);
    });

    ws.on('message', async (data, isBinary) => {
        try {
            const request = JSON.parse(data.toString());
            
            if (request.interaction_type === "update_only") {
                // ... Live Transcript logic (as before) ...
            } else if (request.interaction_type === "response_required") {
                console.log(`[RESPONSE REQUIRED] Latest Transcript: ${request.transcript.map(t => t.content).join(' ')}`);
                
                // *** Call the LLM and STREAM the response back ***
                try {
                    await streamLlama3Response(ws, request.transcript, request.response_id);
                } catch (llmError) {
                    console.error('Error streaming LLM response:', llmError);
                    // Fallback response in case of LLM failure
                    ws.send(JSON.stringify({
                        response_type: 'response',
                        response_id: request.response_id,
                        content: 'I apologize, I seem to be having a temporary issue. Can you please repeat that?',
                        content_complete: true,
                        end_call: false,
                    }));
                }
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed: ${code} - ${reason.toString()}`);
    });
});

// Start the server (omitted for brevity, assume it's the same)
// server.listen(port, () => { /* ... */ });


// ----------------------------------------------------
// 3. LLM Streaming Function
// ----------------------------------------------------

/**
 * Calls the NVIDIA LLM, streams the response, and sends chunks directly to Retell via WebSocket.
 * @param {WebSocket} ws The active WebSocket connection to Retell.
 * @param {Array<{role: 'agent'|'user', content: string}>} transcript 
 * @param {number} responseId The response ID from Retell's response_required message.
 */
async function streamLlama3Response(ws, transcript, responseId) {
    if (!LLM_API_KEY || LLM_API_KEY === 'YOUR_NVIDIA_API_KEY_HERE') {
        throw new Error("NVIDIA API Key is not set.");
    }

    // Convert Retell transcript to LLM chat completion message format
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        // Map 'user' and 'agent' roles directly
        ...transcript.map(t => ({ role: t.role, content: t.content }))
    ];
    
    // Check if the WebSocket is still open before starting the request
    if (ws.readyState !== ws.OPEN) {
        console.warn('WebSocket not open, aborting LLM stream.');
        return;
    }

    try {
        // 1. Initiate the streaming API request
        const completionStream = await openai.chat.completions.create({
            model: LLM_MODEL,
            messages: messages,
            temperature: 0.6,
            top_p: 0.95,
            max_tokens: 150, // Keep this low for faster, more concise voice responses
            stream: true, // Crucial for real-time response
        });

        // 2. Iterate over the stream and send chunks to Retell
        for await (const chunk of completionStream) {
            const content = chunk.choices[0]?.delta?.content;

            if (content) {
                // Send a Retell 'response' message for each content chunk
                ws.send(JSON.stringify({
                    response_type: 'response',
                    response_id: responseId, // Critical: Must match the request ID
                    content: content,
                    content_complete: false, // Indicates more content is coming
                    end_call: false,
                }));
            }
        }

        // 3. Send the final message to complete the response
        ws.send(JSON.stringify({
            response_type: 'response',
            response_id: responseId,
            content: '', // Content is empty in the final chunk since all content was streamed
            content_complete: true, // CRITICAL: Tells Retell the agent's turn is done
            end_call: false,
        }));
        console.log(`Successfully streamed response for ID: ${responseId}`);

    } catch (error) {
        console.error('Error during LLM stream:', error);
        throw error;
    }
}

server.listen(port, () => {
    console.log(`Node.js HTTP/WebSocket server listening on port ${port}`);
    console.log(`WebSocket path: ws://localhost:${port}${wssPath}<call_id>`);
});