export async function onRequest(context) {
    const GITHUB_TOKEN = context.env.GITHUB_PAT;
    const REPO_OWNER = "larrydispatcherfdsales-blip";
    const REPO_NAME = "workflow-engine-backend";

    try {
        const { action, task_path } = await context.request.json();

        // Step 1: Workflow ko trigger karna
        const dispatchUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/main.yml/dispatches`;
        await fetch(dispatchUrl, {
            method: 'POST',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Cloudflare-Worker' },
            body: JSON.stringify({ ref: 'main', inputs: { action, task_path: task_path || "" } } )
        });

        // Agar action 'fetch_task' nahi hai, to foran kamyabi ka jawab bhej do
        if (action !== 'fetch_task') {
            return new Response(JSON.stringify({ message: `Action '${action}' triggered successfully.` }), { headers: { 'Content-Type': 'application/json' } });
        }

        // --- Sirf 'fetch_task' ke liye, hum output ka intezar karenge ---

        // Step 2: Thora intezar taake workflow shuru ho sake
        await new Promise(resolve => setTimeout(resolve, 8000)); // 8 second ka intezar

        // Step 3: Sab se naye workflow run ki ID haasil karna
        const runsUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/main.yml/runs?status=completed&per_page=1`;
        const runsResponse = await fetch(runsUrl, { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'Cloudflare-Worker' } } );
        const runsData = await runsResponse.json();
        if (runsData.workflow_runs.length === 0) throw new Error("Could not find a completed workflow run.");
        
        const latestRunId = runsData.workflow_runs[0].id;
        const jobsUrl = runsData.workflow_runs[0].jobs_url;

        // Step 4: Job se output haasil karna
        const jobsResponse = await fetch(jobsUrl, { headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'User-Agent': 'Cloudflare-Worker' } });
        const jobsData = await jobsResponse.json();
        const manageTasksJob = jobsData.jobs.find(job => job.name === 'manage_tasks');
        
        // Job ke steps mein se output nikalna
        const steps = manageTasksJob.steps;
        const performActionStep = steps.find(step => step.name === 'Perform Action and Push Changes');
        const fetchedTaskPath = performActionStep.outputs.new_task_path;

        return new Response(JSON.stringify({
            message: `Workflow '${action}' completed!`,
            fetched_task_path: fetchedTaskPath
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        return new Response(JSON.stringify({ message: `Error: ${error.message}` }), { status: 500 });
    }
}
