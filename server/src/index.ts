import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import 'dotenv/config'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
    return c.text('Ayah of the day!')
})
//
const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const AUTH_URL = 'https://oauth2.quran.foundation/oauth2/token';
const API_BASE_URL = 'https://apis.quran.foundation/content/api/v4';

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAccessToken() {
    if (accessToken && tokenExpiresAt > Date.now()) {
        return accessToken;
    }
    // console.log("GETTING TOKEN");
    const auth: string = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await fetch(AUTH_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&scope=content'
        })

        const data = await response.json();
        //set token expiration time 1 minutes before actual expiry
        tokenExpiresAt = Date.now() + (data.expires_in * 1000) - (1000 * 60 * 1);
        accessToken = data.access_token;
        // console.log("TOKEN: ", accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error getting access token:', error);
    }
}


async function getRandomAyah() {
    await getAccessToken();
    if (!accessToken) {
        throw new Error('Access token not found');
    }
    // console.log(accessToken);
    const response = await fetch(`${API_BASE_URL}/verses/random?words=true&translations=20,131&audio=7&fields=text_uthmani`, {
        method: 'GET',
        headers: {
            'x-auth-token': accessToken,
            'x-client-id': clientId
        }

    })
    return response.json();
}


app.get('/api/random-ayah', async (c) => {
    const ayah = await getRandomAyah();
    return c.json(ayah);
})


serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})
