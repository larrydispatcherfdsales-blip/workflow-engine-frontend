// Cloudflare Function: functions/get-reports.js
export async function onRequest(context) {
    const { env } = context;
    const GITHUB_PAT = env.GITHUB_PAT;
    const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
    const DB_REPO_NAME = "workflow-engine-db";

    // Abhi ke liye, hum sirf 'client_A_demo' ke liye report bana rahe hain
    const CLIENT_FOLDER = "client_A_demo";

    try {
        // Step 1: DB repo ki tamam commits haasil karna
        const commitsUrl = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/commits`;
        const commitsResponse = await fetch(commitsUrl, {
            headers: { 'Authorization': `token ${GITHUB_PAT}`, 'User-Agent': 'NexusFlow-Reporter' },
        } );
        if (!commitsResponse.ok) throw new Error("Could not fetch commits from DB repo.");
        const commits = await commitsResponse.json();

        // Step 2: Agent performance ka data process karna
        const agentPerformance = {};

        for (const commit of commits) {
            const commitMessage = commit.commit.message;
            const author = commit.commit.author.name; // Hum commit karne wale ka naam istemal kar rahe hain

            // Hum sirf un commits ko dekhenge jo 'approve_qc' ya 'ai_qc_result' (passed) se hue hain
            if (commitMessage.includes("approve_qc") || (commitMessage.includes("ai_qc_result") && commitMessage.includes("passed"))) {
                // Yahan hum commit message se agent ka naam nikalne ka logic likh sakte hain,
                // lekin abhi ke liye, hum yeh farz karte hain ke har 'completed' task ek agent ne kiya hai.
                // Asal app mein, humein har task ke sath agent ki ID save karni hogi.

                // Abhi ke liye, hum sirf commit ke author (jo ke "GitHub Actions Bot" hoga) ko count karte hain
                // Isay behtar banane ke liye, humein commit message mein agent ka naam shamil karna hoga.
                
                // Simple Logic: Hum "GitHub Actions Bot" ke completed tasks count karte hain
                if (!agentPerformance[author]) {
                    agentPerformance[author] = { tasksCompleted: 0 };
                }
                agentPerformance[author].tasksCompleted++;
            }
        }

        // Data ko ek array mein tabdeel karna taake frontend par aasani se istemal ho sake
        const reportData = Object.keys(agentPerformance).map(agentName => ({
            agentName: agentName,
            tasksCompleted: agentPerformance[agentName].tasksCompleted,
            avgTime: "N/A", // Yeh hum baad mein add karenge
            rejectionRate: "N/A" // Yeh hum baad mein add karenge
        }));

        return new Response(JSON.stringify(reportData), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
