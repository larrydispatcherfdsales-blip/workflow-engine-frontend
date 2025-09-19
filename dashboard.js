document.addEventListener('DOMContentLoaded', function() {
    // Modal ke elements ko pakarna
    const loadingModal = document.getElementById('loadingModal');
    const modalMessage = document.getElementById('modalMessage');
    const spinner = document.getElementById('spinner');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // ... (baqi tamam elements waisay hi)

    // Naye Helper Functions: Modal ko control karne ke liye
    function showModal(message) {
        modalMessage.textContent = message;
        spinner.style.display = 'block';
        closeModalBtn.style.display = 'none';
        loadingModal.style.display = 'flex';
    }

    function showModalResult(message, isSuccess) {
        modalMessage.textContent = message;
        spinner.style.display = 'none'; // Spinner chupa do
        closeModalBtn.style.display = 'block'; // Close button dikhao
        // Aap yahan par success/error ke liye alag colors bhi set kar sakte hain
    }

    closeModalBtn.addEventListener('click', () => {
        loadingModal.style.display = 'none';
    });

    // ... (getSession function waisa hi rahega)

    // --- Tamam Workflow Functions Ko Update Karna ---

    async function triggerMainWorkflow(action, payload = {}) {
        showModal('Processing your request...'); // Modal dikhao
        try {
            const response = await fetch('/trigger-workflow', { /* ... (body waisi hi) */ });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showModalResult('Action triggered successfully!', true); // Kamyabi ka message
            return result;
        } catch (error) {
            showModalResult(`Error: ${error.message}`, false); // Nakami ka message
            return null;
        }
    }

    async function triggerAiQcWorkflow(payload = {}) {
        showModal('Submitting for AI Quality Check...'); // Modal dikhao
        try {
            const response = await fetch('/trigger-ai-qc', { /* ... (body waisi hi) */ });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showModalResult('AI Quality Check has been started.', true); // Kamyabi ka message
            return result;
        } catch (error) {
            showModalResult(`Error during AI QC: ${error.message}`, false); // Nakami ka message
            return null;
        }
    }

    // ... (getFileContent, getSchemaForJob, generateForm functions waisay hi rahenge)

    // --- Button Click Handlers (ab inmein alert() nahi hai) ---

    fetchBtn.addEventListener('click', async () => {
        taskDisplay.style.display = 'none';
        showModal('Fetching next available task...'); // Modal dikhao
        const result = await triggerMainWorkflow('fetch_task');
        
        if (result && result.fetched_task_path) {
            // ... (Task fetch karke dikhane ka poora logic waisa hi)
            loadingModal.style.display = 'none'; // Kaam hone par modal chupa do
        } else {
            showModalResult("No new tasks found or an error occurred.", false);
        }
    });

    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to submit.");
        // ... (Form se data nikalne ka logic)

        const result = await triggerAiQcWorkflow({ /* ... (payload) */ });
        
        if (result) {
            taskDisplay.style.display = 'none';
            fetchBtn.style.display = 'block';
            currentTaskPath = null;
        }
    });
});
