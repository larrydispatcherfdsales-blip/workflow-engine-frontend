document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchTaskBtn');
    const submitBtn = document.getElementById('submitQcBtn');
    // ... (baqi elements)

    let currentTaskPath = null;
    const CLIENT_FOLDER = "client_A_demo"; // Humne client ko yahan hard-code kar diya hai

    // Helper Function: trigger-workflow
    async function triggerMainWorkflow(action, payload = {}) {
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Processing...';
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Ab hum har request ke sath client_folder bhi bhej rahe hain
                body: JSON.stringify({ action, client_folder: CLIENT_FOLDER, ...payload })
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

    // Helper Function: trigger-ai-qc
    async function triggerAiQcWorkflow(payload = {}) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting for AI QC...';
        try {
            const response = await fetch('/trigger-ai-qc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Yahan bhi client_folder bhej rahe hain
                body: JSON.stringify({ client_folder: CLIENT_FOLDER, ...payload })
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

    // ... (getFileContent, getSchemaForJob, generateForm functions waisay hi rahenge) ...

    // "Fetch Next Task" ka logic ab triggerMainWorkflow ko call karega
    fetchBtn.addEventListener('click', async () => {
        taskDisplay.style.display = 'none';
        const result = await triggerMainWorkflow('fetch_task');
        // ... (baqi ka logic bilkul waisa hi rahega)
    });

    // "Submit for QC" ka logic ab triggerAiQcWorkflow ko call karega
    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to submit.");
        const formData = {};
        const inputs = formContainer.querySelectorAll('.custom-field-input');
        inputs.forEach(input => { formData[input.id] = input.value; });

        await triggerAiQcWorkflow({ 
            task_path: currentTaskPath,
            form_data_json: JSON.stringify(formData)
        });
        
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });
});
