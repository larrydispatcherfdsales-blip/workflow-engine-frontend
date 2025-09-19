document.addEventListener('DOMContentLoaded', function() {
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

    // Helper Function: Backend Workflow ko trigger karne ke liye
    async function triggerWorkflow(action, payload = {}) {
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Processing...';
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload })
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
        const API_URL = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/contents/${filePath}`;
        try {
            const response = await fetch(API_URL );
            if (!response.ok) throw new Error('File not found in DB repo.');
            const data = await response.json();
            return atob(data.content);
        } catch (error) {
            return `Could not load file content for ${filePath}. Error: ${error.message}`;
        }
    }

    // Naya Helper Function: Job ka schema haasil karna
    async function getSchemaForJob(jobName) {
        const schemaPath = `jobs/${jobName}_schema.json`;
        const content = await getFileContent(schemaPath);
        try {
            return JSON.parse(content);
        } catch (e) {
            return []; // Agar schema nahi hai ya ghalat hai, to khaali form dikhao
        }
    }

    // Naya Helper Function: Schema se form banana
    function generateForm(schema) {
        formContainer.innerHTML = '<h4>Data Entry Form</h4>'; // Reset form
        if (!schema || schema.length === 0) {
            formContainer.innerHTML += '<p>No custom fields for this job.</p>';
            return;
        }
        schema.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.classList.add('form-group');
            formGroup.innerHTML = `
                <label for="${field.id}">${field.label}</label>
                <input type="${field.type}" id="${field.id}" class="custom-field-input">
            `;
            formContainer.appendChild(formGroup);
        });
    }

    // "Fetch Next Task" ka naya, mukammal Logic
    fetchBtn.addEventListener('click', async () => {
        taskDisplay.style.display = 'none';
        const result = await triggerWorkflow('fetch_task');
        
        if (result && result.fetched_task_path) {
            currentTaskPath = result.fetched_task_path;
            taskPathElement.textContent = currentTaskPath;
            
            // Job ka naam file ke naam se nikalna (e.g., ClientX_Medical_Batch1_task1.txt -> ClientX_Medical_Batch1)
            const fileName = currentTaskPath.split('/').pop();
            currentJobName = fileName.split('_').slice(0, -1).join('_');

            const [content, schema] = await Promise.all([
                getFileContent(currentTaskPath),
                getSchemaForJob(currentJobName)
            ]);
            
            taskContentElement.textContent = content;
            generateForm(schema);
            
            taskDisplay.style.display = 'block';
            fetchBtn.style.display = 'none';
        } else {
            alert("No new tasks found or an error occurred.");
        }
    });

    // "Submit for QC" ka naya logic
    submitBtn.addEventListener('click', async () => {
        if (!currentTaskPath) return alert("No active task to submit.");

        // Naya Logic: Form se data nikalna
        const formData = {};
        const inputs = formContainer.querySelectorAll('.custom-field-input');
        inputs.forEach(input => {
            formData[input.id] = input.value;
        });

        // Backend ko task path aur form data dono bhejna
        await triggerWorkflow('submit_for_qc', { 
            task_path: currentTaskPath,
            form_data_json: JSON.stringify(formData)
        });
        
        taskDisplay.style.display = 'none';
        fetchBtn.style.display = 'block';
        currentTaskPath = null;
    });
});
