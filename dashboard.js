document.addEventListener('DOMContentLoaded', function() {
    const fetchBtn = document.getElementById('fetchTaskBtn');
    const submitBtn = document.getElementById('submitQcBtn');
    const taskDisplay = document.getElementById('taskDisplay');
    const taskPathElement = document.getElementById('taskPath');
    const taskContentElement = document.getElementById('taskContent');
    const formContainer = document.getElementById('custom-form-container');
    const loadingModal = document.getElementById('loadingModal');
    const modalMessage = document.getElementById('modalMessage');
    const spinner = document.getElementById('spinner');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let currentTaskPath = null;
    let currentJobName = null;
    let clientFolder = null;
    let session = null;

    const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
    const DB_REPO_NAME = "workflow-engine-db";

    function showModal(message) { /* ... (Yeh function waisa hi rahega) ... */ }
    function showModalResult(message, isSuccess) { /* ... (Yeh function waisa hi rahega) ... */ }
    closeModalBtn.addEventListener('click', () => { loadingModal.style.display = 'none'; });

    function getSession() {
        const cookies = document.cookie.split('; ');
        const sessionCookie = cookies.find(row => row.startsWith('nexus_session='));
        if (!sessionCookie) return null;
        try {
            return JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]));
        } catch (e) { return null; }
    }

    async function triggerMainWorkflow(action, payload = {}) {
        showModal('Processing your request...');
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, client_folder: clientFolder, triggered_by: session.username, ...payload })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showModalResult('Action triggered successfully!', true);
            return result;
        } catch (error) {
            showModalResult(`Error: ${error.message}`, false);
            return null;
        }
    }

    async function triggerAiQcWorkflow(payload = {}) {
        showModal('Submitting for AI Quality Check...');
        try {
            const response = await fetch('/trigger-ai-qc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_folder: clientFolder, triggered_by: session.username, ...payload })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showModalResult('AI Quality Check has been started.', true);
            return result;
        } catch (error) {
            showModalResult(`Error during AI QC: ${error.message}`, false);
            return null;
        }
    }

    async function getFileContent(filePath) { /* ... (Yeh function waisa hi rahega) ... */ }
    async function getSchemaForJob(jobName) { /* ... (Yeh function waisa hi rahega) ... */ }
    function generateForm(schema) { /* ... (Yeh function waisa hi rahega) ... */ }

    // --- Main Logic ---
    session = getSession();
    if (!session) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = '/index.html';
        return;
    } else {
        clientFolder = session.company_id;
    }

    fetchBtn.addEventListener('click', async () => { /* ... (Yeh function waisa hi rahega) ... */ });
    submitBtn.addEventListener('click', async () => { /* ... (Yeh function waisa hi rahega) ... */ });
});
