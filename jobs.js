document.addEventListener('DOMContentLoaded', function() {
    const createJobBtn = document.getElementById('createJobBtn');
    const zipFileInput = document.getElementById('zipFile');
    const jobNameInput = document.getElementById('jobName');
    const statusMessage = document.getElementById('statusMessage');
    const addFieldBtn = document.getElementById('addFieldBtn');
    const fieldsContainer = document.getElementById('fields-container');
    // Naye financial fields ko pakarna
    const agentCostInput = document.getElementById('agentCost');
    const revenuePerTaskInput = document.getElementById('revenuePerTask');

    let fieldCounter = 0;
    // ... (session ka logic waisa hi rahega)

    addFieldBtn.addEventListener('click', () => { /* ... (Yeh function waisa hi rahega) ... */ });

    createJobBtn.addEventListener('click', async function() {
        const jobName = jobNameInput.value.trim();
        const file = zipFileInput.files[0];

        if (!jobName || !file) { /* ... (validation waisi hi) */ }
        if (/\s/.test(jobName)) { /* ... (validation waisi hi) */ }

        // Custom fields ka schema banana
        const customFields = [];
        const fieldRows = fieldsContainer.querySelectorAll('.field-row');
        fieldRows.forEach((row, index) => { /* ... (yeh logic waisa hi) */ });

        // Naya Logic: Financial data ko schema mein shamil karna
        const jobSchema = {
            fields: customFields,
            financials: {
                agentCostPerHour: agentCostInput.value || 0,
                revenuePerTask: revenuePerTaskInput.value || 0
            }
        };

        createJobBtn.disabled = true;
        statusMessage.textContent = 'Uploading file and creating job...';

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
                        triggered_by: session.username,
                        job_name: jobName,
                        zip_file_base64: base64File,
                        // Ab hum poora jobSchema object bhej rahe hain
                        schema_json: JSON.stringify(jobSchema)
                    })
                });
                // ... (baqi ka logic waisa hi)
            };
            // ... (onerror logic)
        } catch (error) {
            // ... (error handling)
        }
    });
});
