import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import fetch from 'node-fetch'; // Polyfill fetch for Node environment
import {
    getLeaveStatus,
    getMyTasks,
    getUpcomingHolidays,
    getCompanyPolicies
} from '@/lib/ai-tools';

// Polyfill global fetch if needed
if (!global.fetch) {
    (global as any).fetch = fetch;
    (global as any).Headers = (fetch as any).Headers;
    (global as any).Request = (fetch as any).Request;
    (global as any).Response = (fetch as any).Response;
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserInfo() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log('[AI AUTH DEBUG] Token present:', !!token);

    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, SECRET);
        console.log('[AI AUTH DEBUG] Verified User:', payload.userId, payload.role);
        return { userId: payload.userId as string, role: payload.role as string };
    } catch (err) {
        console.error('[AI AUTH DEBUG] JWT Verification Failed:', err);
        return null;
    }
}

// Define the tools for Gemini
const tools = [
    {
        functionDeclarations: [
            {
                name: "getLeaveStatus",
                description: "Get the current leave requests, balance and status of the current employee.",
                parameters: { type: "OBJECT", properties: {}, required: [] }
            },
            {
                name: "getMyTasks",
                description: "Get the list of active and pending tasks assigned to the current employee.",
                parameters: { type: "OBJECT", properties: {}, required: [] }
            },
            {
                name: "getUpcomingHolidays",
                description: "Get the list of upcoming company holidays.",
                parameters: { type: "OBJECT", properties: {}, required: [] }
            },
            {
                name: "getCompanyPolicies",
                description: "Get information about shift timings, grace periods, and office policies.",
                parameters: { type: "OBJECT", properties: {}, required: [] }
            }
        ],
    },
];

export async function POST(req: Request) {
    console.log('[AI CHAT] Request received');

    // Check Config
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('[AI CHAT CONFIG ERROR] Missing GEMINI_API_KEY in .env.local');
        return NextResponse.json({ message: 'AI Assistant is not configured (Missing API Key). Check .env.local.' }, { status: 503 });
    }
    console.log('[AI CHAT] API Key present (length):', apiKey.length);

    // Check Auth
    const userInfo = await getUserInfo();
    if (!userInfo) {
        console.warn('[AI CHAT AUTH ERROR] User not logged in or invalid token');
        return NextResponse.json({ message: 'Unauthorized: Please log in.' }, { status: 401 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const { message, history } = await req.json();

        // Use gemini-flash-latest as confirmed available in listModels for this key
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            tools: tools as any,
        });

        console.log('[AI CHAT] Starting chat with model: gemini-flash-latest');

        const chat = model.startChat({
            history: history || [],
        });

        console.log('[AI CHAT] Sending message to Gemini:', message.substring(0, 50) + '...');
        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text(); // Explicitly get text to ensure response is valid
        console.log('[AI CHAT] Received response from Gemini. Length:', text.length);

        // Handle potential function calls (simplified for single-step for now)
        const calls = response.functionCalls();
        if (calls && calls.length > 0) {
            const call = calls[0];
            console.log('[AI CHAT] Tool call detected:', call.name);
            let toolResult;

            if (call.name === "getLeaveStatus") {
                toolResult = await getLeaveStatus(userInfo.userId);
            } else if (call.name === "getMyTasks") {
                toolResult = await getMyTasks(userInfo.userId);
            } else if (call.name === "getUpcomingHolidays") {
                toolResult = await getUpcomingHolidays();
            } else if (call.name === "getCompanyPolicies") {
                toolResult = await getCompanyPolicies();
            }

            console.log('[AI CHAT] Tool executed. Result:', JSON.stringify(toolResult).substring(0, 50));

            if (toolResult) {
                const secondResult = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: { content: toolResult }
                    }
                }]);
                return NextResponse.json({
                    text: secondResult.response.text(),
                    history: await chat.getHistory()
                });
            }
        }

        return NextResponse.json({
            text: text,
            history: await chat.getHistory()
        });

    } catch (err: any) {
        console.error('[AI CHAT CRITICAL ERROR]:', err);

        // Handle Quota/Rate Limit Errors (429)
        if (err.message?.includes('429') || err.status === 429) {
            return NextResponse.json({
                message: 'AI Quota Exceeded: Please wait a minute or upgrade your Gemini API plan.'
            }, { status: 429 });
        }

        // FORCE LOG TO FILE
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'debug_error.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] ERROR: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}\n`);
        } catch (logErr) {
            console.error('Failed to write to log file:', logErr);
        }

        return NextResponse.json({ message: 'Failed to process AI request: ' + (err.message || 'Unknown error') }, { status: 500 });
    }
}
