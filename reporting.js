document.addEventListener('DOMContentLoaded', function() {
    const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
    const DB_REPO_NAME = "workflow-engine-db";

    async function fetchFolderCount(folderPath) {
        const API_URL = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/contents/${folderPath}`;
        try {
            const response = await fetch(API_URL );
            if (response.status === 404) return 0; // Agar folder nahi hai, to count 0 hai
            const data = await response.json();
            // .gitkeep jaisi files ko count na karein
            return Array.isArray(data) ? data.filter(item => item.name !== '.gitkeep').length : 0;
        } catch (error) {
            console.error(`Error fetching count for ${folderPath}:`, error);
            return 'N/A';
        }
    }

    async function updateAllCounts() {
        document.getElementById('count-todo').textContent = await fetchFolderCount('tasks/todo');
        document.getElementById('count-inprogress').textContent = await fetchFolderCount('tasks/inprogress');
        document.getElementById('count-in_qc').textContent = await fetchFolderCount('tasks/in_qc');
        document.getElementById('count-completed').textContent = await fetchFolderCount('tasks/completed');
    }

    // Page load hone par foran counts update karein
    updateAllCounts();

    // Har 30 second baad automatically refresh karein
    setInterval(updateAllCounts, 30000);
});
