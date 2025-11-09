import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@repo/db';

// Initialize the Google OAuth2 client
// We read the credentials securely from the .env.local file
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// This MUST match the "Authorized redirect URIs" in your Google Cloud Console
// For web apps, it's typically just your app's origin
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

/**
 * POST /api/auth/google/connect
 * This endpoint is called by the frontend after the user signs in.
 * It exchanges the one-time authorization 'code' for a long-lived
 * 'refresh_token' and saves it to the broker's User record.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // 1. Exchange the code for tokens (access_token and refresh_token)
    const { tokens } = await oauth2Client.getToken(code as string);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      // This happens if the user has already granted permission.
      // You may need to ask them to re-authenticate.
      return NextResponse.json(
        { error: 'No refresh_token received. User may already be authenticated.' },
        { status: 400 },
      );
    }

    // 2. Use the new tokens to get the user's profile (email, name)
    oauth2Client.setCredentials(tokens);
    const { data } = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
    
    const userEmail = data.email as string;
    const userName = data.name as string;

    if (!userEmail) {
      return NextResponse.json({ error: 'Could not get user email from Google' }, { status: 500 });
    }

    // 3. Save the refresh_token to the database
    // upsert = "update or insert". It finds a user by email,
    // or creates them if they don't exist.
    await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        name: userName,
        googleRefreshToken: refreshToken,
      },
      create: {
        email: userEmail,
        name: userName,
        googleRefreshToken: refreshToken,
      },
    });
    
    console.log('Successfully saved refresh token for user:', userEmail);
    return NextResponse.json({ success: true, email: userEmail });

  } catch (error) {
    console.error('Error during Google auth token exchange:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
