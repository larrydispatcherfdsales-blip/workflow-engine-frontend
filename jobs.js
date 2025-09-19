document.addEventListener('DOMContentLoaded', function() {
    const createJobBtn = document.getElementById('createJobBtn');
    const zipFileInput = document.getElementById('zipFile');
    const jobNameInput = document.getElementById('jobName');
    const statusMessage = document.getElementById('statusMessage');

    createJobBtn.addEventListener('click', async function() {
        const jobName = jobNameInput.value;
        const file = zipFileInput.files[0];

        if (!jobName || !file) {
            alert("Please provide a job name and select a ZIP file.");
            return;
        }

        // Button ko disable karna aur status dikhana
        createJobBtn.disabled = true;
        statusMessage.textContent = 'Uploading file... This may take a moment.';

        try {
            // File ko base64 string mein convert karna
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                // 'data:application/zip;base64,' wala hissa hata kar sirf base64 content nikalna
                const base64File = reader.result.split(',')[1];

                // Naye Cloudflare Worker ko call karna
                const response = await fetch('/upload-job', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobName: jobName,
                        fileContent: base64File
                    })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                statusMessage.textContent = `Success! ${result.message}`;
                alert(`Success! ${result.message}`);
            };

        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            alert(`Error: ${error.message}`);
        } finally {
            createJobBtn.disabled = false;
        }
    });
});
