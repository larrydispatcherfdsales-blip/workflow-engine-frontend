document.addEventListener('DOMContentLoaded', function() {
    const addFieldBtn = document.getElementById('addFieldBtn');
    const fieldsContainer = document.getElementById('fields-container');
    const createJobBtn = document.getElementById('createJobBtn');
    // ... (baqi elements waisay hi)

    let fieldCounter = 0;

    // "Add Field" button ka logic
    addFieldBtn.addEventListener('click', () => {
        fieldCounter++;
        const newField = document.createElement('div');
        newField.classList.add('field-row');
        newField.innerHTML = `
            <input type="text" placeholder="Field Label (e.g., Patient Name)" id="label_${fieldCounter}">
            <select id="type_${fieldCounter}">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
            </select>
        `;
        fieldsContainer.appendChild(newField);
    });

    // "Create Job" button ka naya logic
    createJobBtn.addEventListener('click', async function() {
        // ... (purana file upload wala logic waisa hi)

        // Naya logic: Custom fields ka schema banana
        const customFieldsSchema = [];
        for (let i = 1; i <= fieldCounter; i++) {
            const label = document.getElementById(`label_${i}`).value;
            const type = document.getElementById(`type_${i}`).value;
            if (label) {
                customFieldsSchema.push({ label, type, id: `field_${i}` });
            }
        }

        // ... (File ko base64 mein convert karne ka logic)

        // Cloudflare Worker ko ab schema bhi bhejna
        // const response = await fetch('/upload-job', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         jobName: jobName,
        //         fileContent: base64File,
        //         schema: customFieldsSchema // Naya data
        //     })
        // });
        
        // ... (baqi ka logic)
    });
});
