// This is a Cloudflare Function
export async function onRequest(context) {
    const GITHUB_TOKEN = context.env.GITHUB_PAT;
    const REPO_OWNER = "chuh31481-wq";
    const REPO_NAME = "workflow-engine-backend";

    try {
        const { action, task_path } = await context.request.json();

        // Step 1: Workflow ko trigger karna
        const dispatchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/main.yml/dispatches`;
        const dispatchResponse = await fetch(dispatchUrl, {
            method: 'POST',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Cloudflare-Worker' },
            body: JSON.stringify({ ref: 'main', inputs: { action, task_path: task_path || "" } } )
        });

        if (!dispatchResponse.ok) throw new Error(`GitHub API (dispatch) responded with ${dispatchResponse.status}`);
        
        // --- YEH POORA NAYA LOGIC HAI ---

        // Step 2: Workflow ke shuru hone ka intezar karna
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second ka intezar

        // Step 3: Sab se naye workflow run ki ID haasil karna
        const runsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/main.yml/runs`;
        const runsResponse = await fetch(runsUrl, { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'Cloudflare-Worker' } } );
        const runsData = await runsResponse.json();
        const latestRunId = runsData.workflow_runs[0].id;

        // Step 4: Workflow ke mukammal hone ka intezar karna
        let runStatus = '';
        let jobUrl = '';
        while (runStatus !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Har 3 second baad check karna
            const runStatusResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${latestRunId}`, { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'Cloudflare-Worker' } } );
            const runStatusData = await runStatusResponse.json();
            runStatus = runStatusData.status;
            jobUrl = runStatusData.jobs_url; // Job URL haasil karna
        }

        // Step 5: Job se output haasil karna
        const jobsResponse = await fetch(jobUrl, { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'Cloudflare-Worker' } });
        const jobsData = await jobsResponse.json();
        const fetchedTaskPath = jobsData.jobs[0].steps.find(step => step.name === 'Perform Action on Task').outputs.new_task_path;

        return new Response(JSON.stringify({
            message: `Workflow '${action}' completed!`,
            fetched_task_path: fetchedTaskPath // Task ka path wapas bhejna
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        return new Response(JSON.stringify({ message: `Error: ${error.message}` }), { status: 500 });
    }
}
