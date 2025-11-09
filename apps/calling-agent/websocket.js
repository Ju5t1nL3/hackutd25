import { WebSocketServer } from 'ws';
import http from 'http';
import OpenAI from 'openai';
import 'dotenv/config';

// --- Configuration for External LLM (Unchanged) ---
const LLM_API_KEY = process.env.NVIDIA_API_KEY;
const LLM_ENDPOINT = 'https://integrate.api.nvidia.com/v1';
const LLM_MODEL = 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
const SYSTEM_PROMPT = "You are a helpful and conversational AI agent for a real estate agency. Please get the caller's information and schedule property viewings in a friendly manner. Detailed thinking off";

const openai = new OpenAI({
    apiKey: LLM_API_KEY,
    baseURL: LLM_ENDPOINT,
});

// ----------------------------------------------------
// 1. Setup HTTP Server and WebSocket Servers
// ----------------------------------------------------
const port = 3000;

// --- NEW: Define paths for our two WebSocket services ---
const retellPath = '/llm-websocket/';
const transcriptPath = '/transcript-websocket/';

// Create the HTTP server
const server = http.createServer((req, res) => {
    // Basic HTTP response (e.g., for health checks)
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// --- NEW: Create TWO WebSocket server instances ---
// 'noServer: true' means we'll manually handle the upgrade process
const wssRetell = new WebSocketServer({ noServer: true });
const wssTranscript = new WebSocketServer({ noServer: true });

// --- NEW: A Map to store transcript viewers by callId ---
// Key: callId (string)
// Value: Set<WebSocket> (A set of all browser clients watching that call)
const transcriptClients = new Map();

// Handle regular HTTP requests being UPGRADED to a WebSocket connection
server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);
    const callId = pathname.split('/').pop();

    if (!callId) {
        console.log('[UPGRADE REJECTED] No callId provided.');
        socket.destroy();
        return;
    }

    // --- NEW: Route connection based on path ---

    if (pathname.startsWith(retellPath)) {
        // Handle Retell LLM connection
        wssRetell.handleUpgrade(request, socket, head, (ws) => {
            ws.callId = callId; // Store callId on the connection object
            console.log(`Retell WebSocket connected for call ID: ${callId}`);
            wssRetell.emit('connection', ws, request);
        });

    } else if (pathname.startsWith(transcriptPath)) {
        // Handle Transcript Viewer connection
        wssTranscript.handleUpgrade(request, socket, head, (ws) => {
            ws.callId = callId; // Store callId on the connection object
            console.log(`Transcript Viewer connected for call ID: ${callId}`);
            wssTranscript.emit('connection', ws, request);
        });

    } else {
        console.log(`[UPGRADE REJECTED] Path does not match. Destroying socket.`);
        socket.destroy(); // Reject other upgrade requests
    }
});

// ----------------------------------------------------
// 2. NEW: Logic for Transcript Viewer Connections
// ----------------------------------------------------
wssTranscript.on('connection', (ws, req) => {
    const callId = ws.callId;

    // Add this viewer to our Map
    if (!transcriptClients.has(callId)) {
        transcriptClients.set(callId, new Set());
    }
    transcriptClients.get(callId).add(ws);
    console.log(`Viewers for ${callId}: ${transcriptClients.get(callId).size}`);

    ws.on('error', (err) => {
        console.error('Error in Transcript Viewer socket:', err);
    });

    ws.on('close', () => {
        console.log(`Transcript Viewer disconnected for call ID: ${callId}`);
        const viewers = transcriptClients.get(callId);
        if (viewers) {
            viewers.delete(ws); // Remove this specific client
            if (viewers.size === 0) {
                transcriptClients.delete(callId); // Clean up Map if no viewers left
                console.log(`No viewers left for ${callId}, removing from Map.`);
            }
        }
    });
});

/**
 * --- NEW: Helper function to broadcast transcripts ---
 * @param {string} callId
 * @param {object} transcriptData
 */
function broadcastTranscript(callId, transcriptData) {
    const viewers = transcriptClients.get(callId);
    if (viewers && viewers.size > 0) {
        const message = JSON.stringify({
            type: 'transcript_update',
            data: transcriptData,
        });

        viewers.forEach(viewerWs => {
            if (viewerWs.readyState === viewerWs.OPEN) {
                viewerWs.send(message);
            }
        });
    }
}

/**
 * --- NEW: Helper function to notify viewers the call ended ---
 * @param {string} callId
 */
function notifyCallEnd(callId) {
    const viewers = transcriptClients.get(callId);
    if (viewers) {
        const message = JSON.stringify({ type: 'call_ended' });
        viewers.forEach(viewerWs => {
            if (viewerWs.readyState === viewerWs.OPEN) {
                viewerWs.send(message);
                viewerWs.close(); // Close the connection to the viewer
            }
        });
        transcriptClients.delete(callId); // Clean up
        console.log(`Notified viewers and cleaned up Map for ended call: ${callId}`);
    }
}


// ----------------------------------------------------
// 3. Implement the Retell LLM WebSocket Protocol (Streaming Logic)
// ----------------------------------------------------
wssRetell.on('connection', (ws, req) => {
    // We already stored callId on 'ws' during the upgrade
    const callId = ws.callId;

    // Initial message to allow the user to speak first.
    ws.send(JSON.stringify({
        response_type: 'response',
        content: '',
        end_call: false,
    }));

    ws.on('error', (err) => {
        console.error('Error received in Retell LLM websocket:', err);
    });

    ws.on('message', async (data, isBinary) => {
        try {
            const request = JSON.parse(data.toString());

            if (request.interaction_type === "update_only") {
                // *** NEW: Broadcast the live transcript ***
                broadcastTranscript(callId, request.transcript);

            } else if (request.interaction_type === "response_required") {
                // *** NEW: Broadcast the final transcript before responding ***
                broadcastTranscript(callId, request.transcript);
                
                // Call the LLM and STREAM the response back (unchanged)
                try {
                    await streamLlama3Response(ws, request.transcript, request.response_id);
                } catch (llmError) {
                    console.error('Error streaming LLM response:', llmError);
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
        console.log(`Retell WebSocket connection closed: ${code} - ${reason.toString()}`);
        // *** NEW: Notify viewers the call has ended ***
        notifyCallEnd(callId);
    });
});

// ----------------------------------------------------
// 4. LLM Streaming Function (Unchanged)
// ----------------------------------------------------
async function streamLlama3Response(ws, transcript, responseId) {
    if (!LLM_API_KEY || LLM_API_KEY === 'YOUR_NVIDIA_API_KEY_HERE') {
        throw new Error("NVIDIA API Key is not set.");
    }

    const messages = [
        { role: 'system', content: '/no_think' },
        { role: 'system', content: SYSTEM_PROMPT },
        ...transcript.map(t => ({ role: t.role, content: t.content }))
    ];

    if (ws.readyState !== ws.OPEN) {
        console.warn('WebSocket not open, aborting LLM stream.');
        return;
    }

    try {
        const completionStream = await openai.chat.completions.create({
            model: LLM_MODEL,
            messages: messages,
            temperature: 0.6,
            top_p: 0.95,
            max_tokens: 150,
            stream: true,
        });

        for await (const chunk of completionStream) {
            const content = chunk.choices[0]?.delta?.content;

            if (content) {
                ws.send(JSON.stringify({
                    response_type: 'response',
                    response_id: responseId,
                    content: content,
                    content_complete: false,
                    end_call: false,
                }));
            }
        }

        ws.send(JSON.stringify({
            response_type: 'response',
            response_id: responseId,
            content: '',
            content_complete: true,
            end_call: false,
        }));
        console.log(`Successfully streamed response for ID: ${responseId}`);

    } catch (error) {
        console.error('Error during LLM stream:', error);
        throw error;
    }
}

// ----------------------------------------------------
// 5. Start the server
// ----------------------------------------------------
server.listen(port, () => {
    console.log(`Node.js HTTP/WebSocket server listening on port ${port}`);
    console.log(`Retell LLM Path: ws://localhost:${port}${retellPath}<call_id>`);
    console.log(`Transcript Viewer Path: ws://localhost:${port}${transcriptPath}<call_id>`);
});