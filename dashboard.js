document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchTaskBtn');
    const submitBtn = document.getElementById('submitQcBtn');
    const approveBtn = document.getElementById('approveQcBtn');
    const rejectBtn = document.getElementById('rejectQcBtn');
    
    const taskDisplay = document.getElementById('taskDisplay');
    const taskPathElement = document.getElementById('taskPath');
    const taskContentElement = document.getElementById('taskContent');

    let currentTaskPath = null;

    // Helper Function: Backend Workflow ko trigger karne ke liye
    async function triggerWorkflow(action, task_path = "") {
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Processing...';
        
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, task_path })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            return result;
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            return null;
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.textContent = 'Fetch Next Task';
        }
    }

    // Helper Function: GitHub se file ka content laane ke liye
    async function getFileContent(filePath) {
        const DB_REPO_OWNER = "chuh31481-wq";
        const DB_REPO_NAME = "workflow-engine-db";
        const API_URL = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/contents/${filePath}`;
        
        try {
            const response = await fetch(API_URL );
            const data = await response.json();
            // Content base64 encoded hota hai, usay decode karna hai
            return atob(data.content);
        } catch (error) {
            console.error("Error fetching file content:", error);
            return "Could not load file content.";
        }
    }

    // "Fetch Next Task" Button ka naya, mukammal Logic
    fetchBtn.addEventListener('click', async () => {
        taskDisplay.style.display = 'none';
        const result = await triggerWorkflow('fetch_task');
        
        if (result && result.fetched_task_path) {
            currentTaskPath = result.fetched_task_path;
            taskPathElement.textContent = currentTaskPath;
            
            // File ka content haasil karke screen par dikhana
            const content = await getFileContent(currentTaskPath);
            taskContentElement.textContent = content;
            
            // Task display ko dikhana
            taskDisplay.style.display = 'block';
            fetchBtn.style.display = 'none'; // Fetch button ko chupa dena
        } else {
            alert("No new tasks found or an error occurred.");
        }
    });

    // Submit, Approve, Reject ke buttons ka logic (waisa hi rahega)
    submitBtn.addEventListener('click', async () => {
        await triggerWorkflow('submit_for_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block'; // Fetch button ko wapas dikhana
        currentTaskPath = null;
    });
    // ... (approveBtn aur rejectBtn ke liye bhi bilkul aisa hi)
});
