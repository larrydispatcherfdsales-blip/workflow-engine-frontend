document.addEventListener('DOMContentLoaded', function() {
    const createJobBtn = document.getElementById('createJobBtn');
    const zipFileInput = document.getElementById('zipFile');
    const jobNameInput = document.getElementById('jobName');
    const statusMessage = document.getElementById('statusMessage');
    const addFieldBtn = document.getElementById('addFieldBtn');
    const fieldsContainer = document.getElementById('fields-container');

    let fieldCounter = 0;
    let session = null;
    let clientFolder = null;

    function getSession() { /* ... (getSession ka poora code yahan copy karein) ... */ }
    
    session = getSession();
    if (!session) {
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = '/index.html';
        return;
    } else {
        clientFolder = session.company_id;
    }

    addFieldBtn.addEventListener('click', () => { /* ... (Yeh function waisa hi rahega) ... */ });

    createJobBtn.addEventListener('click', async function() {
        // ... (Validation logic waisa hi)
        // ... (Schema banane ka logic waisa hi)

        createJobBtn.disabled = true;
        statusMessage.textContent = 'Uploading file...';

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64File = reader.result.split(',')[1];
                const response = await fetch('/upload-job', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        client_folder: clientFolder,
                        triggered_by: session.username, // Agent ka naam bhejna
                        job_name: jobName,
                        zip_file_base64: base64File,
                        schema_json: JSON.stringify(customFieldsSchema)
                    })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                statusMessage.textContent = `Success! ${result.message}`;
            };
            // ... (onerror logic)
        } catch (error) {
            // ... (error handling)
        }
    });
});
