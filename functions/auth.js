// Cloudflare Function: functions/auth.js
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

    try {
        // Step 1: GitHub se access token haasil karna
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
            } ),
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Step 2: Access token se user ki details haasil karna
        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${accessToken}`, 'User-Agent': 'NexusFlow' },
        } );
        const githubUser = await userResponse.json();

        // Step 3: Apni users.json file se user ko dhoondna
        // (Yeh logic hum agle step mein likhenge. Abhi ke liye, hum user ko direct dashboard par bhej rahe hain)

        // Step 4: User ko dashboard par redirect karna
        const dashboardUrl = new URL('/dashboard.html', url.origin);
        
        // Yahan hum user ka data (e.g., company_id) cookie mein save karenge
        // response.headers.set('Set-Cookie', `session=...`);

        return Response.redirect(dashboardUrl.href, 302);

    } catch (error) {
        return new Response(`Authentication Error: ${error.message}`, { status: 500 });
    }
}
