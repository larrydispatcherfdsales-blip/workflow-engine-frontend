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
        // Tamam buttons ko disable kar dein
        [fetchBtn, submitBtn, approveBtn, rejectBtn].forEach(btn => btn.disabled = true);
        
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
            // Tamam buttons ko wapas enable kar dein
            [fetchBtn, submitBtn, approveBtn, rejectBtn].forEach(btn => btn.disabled = false);
        }
    }

    // --- Event Listeners: Har button ke liye ---

    // 1. "Fetch Next Task" Button ka Logic
    fetchBtn.addEventListener('click', async () => {
        fetchBtn.textContent = 'Fetching...';
        const result = await triggerWorkflow('fetch_task');
        
        if (result) {
            // Agar workflow kamyab ho, to humein task ka path wapas milna chahiye
            // NOTE: Abhi hamara backend workflow path wapas nahi bhej raha, isliye humein usay update karna hoga.
            // Abhi ke liye, hum sirf ek message dikha rahe hain.
            alert("Task fetched! Please go to your 'workflow-engine-db' repo to see the file move to 'inprogress'.");
            // Yahan par hum baad mein task ka content load karne ka code likhenge.
        }
        fetchBtn.textContent = 'Fetch Next Task';
    });

    // 2. "Submit for QC" Button ka Logic
    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) {
            alert("No active task to submit. Please fetch a task first.");
            return;
        }
        await triggerWorkflow('submit_for_qc', currentTaskPath);
        // Kamyabi par, UI ko reset kar dena
        taskDisplay.style.display = 'none';
        currentTaskPath = null;
    });

    // 3. "Approve" Button ka Logic
    approveBtn.addEventListener('click', async () => {
        if (!currentTaskPath) {
            alert("No active task to approve. Please fetch a task first.");
            return;
        }
        await triggerWorkflow('approve_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        currentTaskPath = null;
    });

    // 4. "Reject" Button ka Logic
    rejectBtn.addEventListener('click', async () => {
        if (!currentTaskPath) {
            alert("No active task to reject. Please fetch a task first.");
            return;
        }
        await triggerWorkflow('reject_qc', currentTaskPath);
        taskDisplay.style.display = 'none';
        currentTaskPath = null;
    });
});
