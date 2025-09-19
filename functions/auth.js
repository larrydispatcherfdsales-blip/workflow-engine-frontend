// Cloudflare Function: functions/auth.js
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    // Environment Variables se secrets haasil karna
    const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
    const GITHUB_PAT = env.GITHUB_PAT; // DB repo ko parhne ke liye
    const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
    const DB_REPO_NAME = "workflow-engine-db";

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
        if (!tokenData.access_token) throw new Error("Failed to get access token from GitHub.");
        const accessToken = tokenData.access_token;

        // Step 2: Access token se user ki details haasil karna
        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${accessToken}`, 'User-Agent': 'NexusFlow' },
        } );
        const githubUser = await userResponse.json();
        const githubId = githubUser.id.toString(); // GitHub ID ko string mein convert karna

        // Step 3: Apni users.json file haasil karna
        const usersJsonUrl = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/contents/users.json`;
        const usersJsonResponse = await fetch(usersJsonUrl, {
            headers: { 'Authorization': `token ${GITHUB_PAT}`, 'User-Agent': 'NexusFlow' },
        } );
        if (!usersJsonResponse.ok) throw new Error("Could not fetch users.json from DB repo.");
        const usersJsonData = await usersJsonResponse.json();
        const usersJsonContent = atob(usersJsonData.content);
        const appUsers = JSON.parse(usersJsonContent).users;

        // Step 4: GitHub user ko apni user list mein dhoondna
        const nexusUser = appUsers.find(user => user.github_id === githubId);

        if (!nexusUser) {
            // Agar user hamari list mein nahi hai, to usay error page par bhejna
            return new Response("Access Denied: Your GitHub account is not authorized for this application.", { status: 403 });
        }

        // Step 5: User ka session data banana aur cookie set karna
        const sessionData = {
            github_id: nexusUser.github_id,
            username: nexusUser.github_username,
            company_id: nexusUser.company_id,
            role: nexusUser.role,
        };

        // User ko dashboard par redirect karna
        const dashboardUrl = new URL('/dashboard.html', url.origin);
        const response = Response.redirect(dashboardUrl.href, 302);

        // Session data ko ek secure, HttpOnly cookie mein save karna
        // Note: Hum yahan par data ko JSON string ke tor par save kar rahe hain. Asal production app mein, yahan JWT istemal karna behtar hai.
        response.headers.set('Set-Cookie', `nexus_session=${JSON.stringify(sessionData)}; Path=/; HttpOnly; Secure; SameSite=Lax`);

        return response;

    } catch (error) {
        return new Response(`Authentication Error: ${error.message}`, { status: 500 });
    }
}
