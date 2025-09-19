document.addEventListener('DOMContentLoaded', function() {
    // ... (purane variables waisay hi)
    const CLIENT_FOLDER = "client_A_demo"; // Client ko yahan bhi hard-code kar diya

    // ... ("Add Field" button ka logic waisa hi)

    // "Create Job" button ka naya logic
    createJobBtn.addEventListener('click', async function() {
        // ... (purana validation logic waisa hi)

        // ... (Custom fields ka schema banane ka logic waisa hi)

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
                        client_folder: CLIENT_FOLDER, // Naya data
                        job_name: jobName,
                        zip_file_base64: base64File,
                        schema_json: JSON.stringify(customFieldsSchema)
                    })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                statusMessage.textContent = `Success! ${result.message}`;
                alert(`Success! ${result.message}`);
            };
            // ... (onerror logic)
        } catch (error) {
            // ... (error handling)
        }
    });
});
