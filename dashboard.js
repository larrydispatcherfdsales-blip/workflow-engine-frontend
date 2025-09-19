document.addEventListener('DOMContentLoaded', function() {
    // ... (Tamam purane variables waisay hi rahenge) ...
    const fetchBtn = document.getElementById('fetchTaskBtn');
    const submitBtn = document.getElementById('submitQcBtn');
    const taskDisplay = document.getElementById('taskDisplay');
    const taskPathElement = document.getElementById('taskPath');
    const taskContentElement = document.getElementById('taskContent');
    const formContainer = document.getElementById('custom-form-container');

    let currentTaskPath = null;
    let currentJobName = null;

    const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
    const DB_REPO_NAME = "workflow-engine-db";

    // Helper Function: trigger-workflow (main.yml ke liye)
    async function triggerMainWorkflow(action, payload = {}) {
        // ... (Yeh function bilkul waisa hi rahega jaisa pehle tha)
    }

    // Naya Helper Function: AI QC Workflow ko trigger karne ke liye
    async function triggerAiQcWorkflow(payload = {}) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting for AI QC...';
        try {
            // Hum ek naye Cloudflare worker ko call karenge
            const response = await fetch('/trigger-ai-qc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            alert(`Success: ${result.message}`);
            return result;
        } catch (error) {
            alert(`An error occurred during AI QC: ${error.message}`);
            return null;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit for QC';
        }
    }

    // ... (getFileContent, getSchemaForJob, generateForm, fetchBtn ka logic waisa hi rahega) ...

    // "Submit for QC" ka naya, mukammal logic
    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to submit.");

        // Form se data nikalna
        const formData = {};
        const inputs = formContainer.querySelectorAll('.custom-field-input');
        inputs.forEach(input => {
            formData[input.id] = input.value;
        });

        // Naya Logic: AI QC wale workflow ko trigger karna
        await triggerAiQcWorkflow({ 
            task_path: currentTaskPath,
            form_data_json: JSON.stringify(formData)
        });
        
        // UI ko reset karna
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });
});
