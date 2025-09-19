// Cloudflare Function: functions/upload-job.js
export async function onRequest(context) {
    const GITHUB_TOKEN = context.env.GITHUB_PAT;
    const REPO_OWNER = "larrydispatcherfdsales-blip";
    const REPO_NAME = "workflow-engine-backend"; // Hamara backend engine

    const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/job-processor.yml/dispatches`;

    try {
        const { jobName, fileContent } = await context.request.json( );

        // GitHub Actions ko trigger karna aur payload mein file ka content bhejna
        const response = await fetch(GITHUB_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Cloudflare-Worker',
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    job_name: jobName,
                    zip_file_base64: fileContent
                }
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API dispatch failed with status ${response.status}`);
        }

        return new Response(JSON.stringify({ message: "Job upload started. Tasks will appear in 'To Do' shortly." }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ message: `Error: ${error.message}` }), {
            status: 500,
        });
    }
}
