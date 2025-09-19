document.addEventListener('DOMContentLoaded', function() {
    const DB_REPO_OWNER = "larrydispatcherfdsales-blip";
    const DB_REPO_NAME = "workflow-engine-db";

    // Helper function to update the count on the screen
    function updateCount(elementId, count) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = count;
        }
    }

    // Function to fetch the number of files in a folder
    async function fetchFolderCount(folderPath) {
        const API_URL = `https://api.github.com/repos/${DB_REPO_OWNER}/${DB_REPO_NAME}/contents/${folderPath}`;
        try {
            const response = await fetch(API_URL );
            // If folder doesn't exist, GitHub API returns 404
            if (response.status === 404) {
                return 0;
            }
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            const data = await response.json();
            // Filter out any potential .gitkeep files from the count
            return Array.isArray(data) ? data.filter(item => item.name !== '.gitkeep').length : 0;
        } catch (error) {
            console.error(`Error fetching count for ${folderPath}:`, error);
            return 'N/A'; // Return 'Not Available' on error
        }
    }

    // Main function to fetch and update all counts
    async function updateAllCounts() {
        console.log("Refreshing dashboard counts...");
        // Run all fetch requests in parallel for better performance
        const [todo, inprogress, in_qc, completed] = await Promise.all([
            fetchFolderCount('tasks/todo'),
            fetchFolderCount('tasks/inprogress'),
            fetchFolderCount('tasks/in_qc'),
            fetchFolderCount('tasks/completed')
        ]);

        updateCount('count-todo', todo);
        updateCount('count-inprogress', inprogress);
        updateCount('count-in_qc', in_qc);
        updateCount('count-completed', completed);
    }

    // Initial fetch when the page loads
    updateAllCounts();

    // Automatically refresh the counts every 30 seconds
    setInterval(updateAllCounts, 30000);
});
