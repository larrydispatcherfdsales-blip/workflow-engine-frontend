document.addEventListener('DOMContentLoaded', function() {
    // Tamam buttons aur display elements ko pakarna
    const fetchBtn = document.getElementById('fetchTaskBtn');
    const submitBtn = document.getElementById('submitQcBtn');
    const approveBtn = document.getElementById('approveQcBtn');
    const rejectBtn = document.getElementById('rejectQcBtn');
    
    const taskDisplay = document.getElementById('taskDisplay');
    const taskPathElement = document.getElementById('taskPath');
    const taskContentElement = document.getElementById('taskContent');

    // Ek global variable jismein hum current task ka path save karenge
    let currentTaskPath = null;

    // --- Helper Function: Backend Workflow ko trigger karne ke liye ---
    async function triggerWorkflow(action, task_path = "") {
        // Tamam action buttons ko disable kar dein
        [fetchBtn, submitBtn, approveBtn, rejectBtn].forEach(btn => btn.disabled = true);
        fetchBtn.textContent = 'Processing... Please Wait...';
        
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, task_path })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            alert(`Success: ${result.message}`);
            return result; // Kamyabi par result wapas bhejna

        } catch (error) {
            console.error(`Error during '${action}':`, error);
            alert(`An error occurred: ${error.message}`);
            return null; // Nakami par null wapas bhejna
        } finally {
            // Tamam action buttons ko wapas enable kar dein
            [fetchBtn, submitBtn, approveBtn, rejectBtn].forEach(btn => btn.disabled = false);
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
            if (!response.ok) throw new Error('File not found in DB repo.');
            const data = await response.json();
            return atob(data.content); // Content base64 encoded hota hai, usay decode karna hai
        } catch (error) {
            console.error("Error fetching file content:", error);
            return "Could not load file content.";
        }
    }

    // --- Event Listeners for All Buttons ---

    // 1. "Fetch Next Task" Button
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

    // --- YEH NAYA LOGIC HAI ---

    // 2. "Submit for QC" Button
    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) {
            alert("No active task to submit.");
            return;
        }
        await triggerWorkflow('submit_for_qc', currentTaskPath);
        // UI ko reset kar dena
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });

    // 3. "Approve" Button
    approveBtn.addEventListener('click', async () => {
        if (!currentTaskPath) {
            alert("No active task to approve.");
            return;
        }
        await triggerWorkflow('approve_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });

    // 4. "Reject" Button
    rejectBtn.addEventListener('click', async () => {
        if (!currentTaskPath) {
            alert("No active task to reject.");
            return;
        }
        await triggerWorkflow('reject_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });
});
