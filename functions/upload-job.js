// Cloudflare Function: functions/upload-job.js
export async function onRequest(context) {
    const GITHUB_TOKEN = context.env.GITHUB_PAT;
    const REPO_OWNER = "larrydispatcherfdsales-blip";
    const REPO_NAME = "workflow-engine-backend";
    const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/job-processor.yml/dispatches`;

    try {
        const { client_folder, job_name, zip_file_base64, schema_json } = await context.request.json( );

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
                    client_folder: client_folder,
                    job_name: job_name,
                    zip_file_base64: zip_file_base64,
                    schema_json: schema_json
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API dispatch failed with status ${response.status}: ${errorText}`);
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
