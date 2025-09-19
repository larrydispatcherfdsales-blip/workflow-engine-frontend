// This is a Cloudflare Function
export async function onRequest(context) {
    const GITHUB_TOKEN = context.env.GITHUB_PAT; // Isay hum Cloudflare mein set karenge
    const REPO_OWNER = "chuh31481-wq";
    const REPO_NAME = "workflow-engine-backend";

    const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/main.yml/dispatches`;

    try {
        // Frontend se bheja gaya data haasil karna
        const { action, task_path } = await context.request.json( );

        // GitHub Actions ko trigger karna
        const response = await fetch(GITHUB_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Cloudflare-Worker',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ref: 'main', // main branch par run karna hai
                inputs: {
                    action: action,
                    task_path: task_path || ""
                }
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API responded with ${response.status}`);
        }

        return new Response(JSON.stringify({ message: `Workflow '${action}' triggered successfully!` }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ message: `Error: ${error.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
