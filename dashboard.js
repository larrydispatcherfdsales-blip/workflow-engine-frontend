document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchTaskBtn');
    const submitBtn = document.getElementById('submitQcBtn');
    const approveBtn = document.getElementById('approveQcBtn');
    const rejectBtn = document.getElementById('rejectQcBtn');
    
    const taskDisplay = document.getElementById('taskDisplay');
    const taskPathElement = document.getElementById('taskPath');
    const taskContentElement = document.getElementById('taskContent');

    let currentTaskPath = null;

    async function triggerWorkflow(action, task_path = "") {
        const allButtons = [fetchBtn, submitBtn, approveBtn, rejectBtn];
        allButtons.forEach(btn => btn.disabled = true);
        fetchBtn.textContent = 'Processing...';
        
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, task_path })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(`Success: ${result.message}`);
            return result;
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            return null;
        } finally {
            allButtons.forEach(btn => btn.disabled = false);
            fetchBtn.textContent = 'Fetch Next Task';
        }
    }

    async function getFileContent(filePath) {
        const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
        const DB_REPO_NAME = "workflow-engine-db";
        const API_URL = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/contents/${filePath}`;
        
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `token ${context.env.GITHUB_PAT}` } // Assuming PAT is available
            } );
            if (!response.ok) throw new Error('File not found in DB repo.');
            const data = await response.json();
            return atob(data.content);
        } catch (error) {
            return "Could not load file content.";
        }
    }

    fetchBtn.addEventListener('click', async () => {
        taskDisplay.style.display = 'none';
        const result = await triggerWorkflow('fetch_task');
        
        if (result && result.fetched_task_path) {
            currentTaskPath = result.fetched_task_path;
            taskPathElement.textContent = currentTaskPath;
            
            const content = await getFileContent(currentTaskPath);
            taskContentElement.textContent = content;
            
            taskDisplay.style.display = 'block';
            fetchBtn.style.display = 'none';
        } else {
            alert("No new tasks found or an error occurred.");
        }
    });

    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to submit.");
        await triggerWorkflow('submit_for_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });

    approveBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to approve.");
        await triggerWorkflow('approve_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });

    rejectBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to reject.");
        await triggerWorkflow('reject_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });
});
