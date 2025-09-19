document.addEventListener('DOMContentLoaded', function() {
    const createJobBtn = document.getElementById('createJobBtn');
    const zipFileInput = document.getElementById('zipFile');
    const jobNameInput = document.getElementById('jobName');
    const statusMessage = document.getElementById('statusMessage');
    const addFieldBtn = document.getElementById('addFieldBtn');
    const fieldsContainer = document.getElementById('fields-container');

    let fieldCounter = 0;

    // "Add Field" button ka logic
    addFieldBtn.addEventListener('click', () => {
        fieldCounter++;
        const fieldId = `field_row_${fieldCounter}`;
        const newField = document.createElement('div');
        newField.classList.add('field-row');
        newField.id = fieldId;
        newField.innerHTML = `
            <input type="text" placeholder="Field Label (e.g., Patient Name)" class="field-label">
            <select class="field-type">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
            </select>
            <button type="button" class="remove-field-btn" onclick="document.getElementById('${fieldId}').remove()">-</button>
        `;
        fieldsContainer.appendChild(newField);
    });

    // "Create Job" button ka naya logic
    createJobBtn.addEventListener('click', async function() {
        const jobName = jobNameInput.value.trim();
        const file = zipFileInput.files[0];

        if (!jobName || !file) {
            alert("Please provide a job name and select a ZIP file.");
            return;
        }
        // Job name mein space na ho
        if (/\s/.test(jobName)) {
            alert("Job Name cannot contain spaces.");
            return;
        }

        // Custom fields ka schema (structure) banana
        const customFieldsSchema = [];
        const fieldRows = fieldsContainer.querySelectorAll('.field-row');
        fieldRows.forEach((row, index) => {
            const label = row.querySelector('.field-label').value;
            const type = row.querySelector('.field-type').value;
            if (label) {
                customFieldsSchema.push({ 
                    id: `custom_field_${index}`,
                    label: label, 
                    type: type 
                });
            }
        });

        createJobBtn.disabled = true;
        statusMessage.textContent = 'Uploading file and creating job... This may take a moment.';

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64File = reader.result.split(',')[1];

                // Naye Cloudflare Worker ko call karna
                const response = await fetch('/upload-job', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_name: jobName,
                        zip_file_base64: base64File,
                        schema_json: JSON.stringify(customFieldsSchema) // Schema ko JSON string ke tor par bhejna
                    })
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message);

                statusMessage.textContent = `Success! ${result.message}`;
                alert(`Success! ${result.message}`);
            };
            reader.onerror = () => {
                throw new Error("Failed to read the file.");
            };

        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
            alert(`Error: ${error.message}`);
            createJobBtn.disabled = false;
        }
    });
});
