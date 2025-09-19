document.addEventListener('DOMContentLoaded', function() {
    const leaderboardBody = document.getElementById('leaderboard-body');

    // ... (purana fetchFolderCount aur updateAllCounts ka logic waisa hi rahega) ...

    // Naya Function: Leaderboard ka data fetch karna aur table banana
    async function updateLeaderboard() {
        try {
            const response = await fetch('/get-reports');
            if (!response.ok) throw new Error("Failed to load report data.");
            
            const reportData = await response.json();
            
            // Table ko khaali karna
            leaderboardBody.innerHTML = '';

            if (reportData.length === 0) {
                leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No performance data available yet.</td></tr>';
                return;
            }

            // Har agent ke liye table mein ek row banana
            reportData.forEach(agent => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${agent.agentName}</td>
                    <td>${agent.tasksCompleted}</td>
                    <td>${agent.avgTime}</td>
                    <td>${agent.rejectionRate}</td>
                `;
                leaderboardBody.appendChild(row);
            });

        } catch (error) {
            leaderboardBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Error: ${error.message}</td></tr>`;
        }
    }

    // Page load hone par tamam reports update karein
    function initializeDashboard() {
        updateAllCounts();
        updateLeaderboard();
    }

    initializeDashboard();
});
