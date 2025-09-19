document.addEventListener('DOMContentLoaded', function() {
    const fetchButton = document.getElementById('fetchTaskBtn');
    const taskDisplay = document.getElementById('taskDisplay');
    const taskPathElement = document.getElementById('taskPath');

    fetchButton.addEventListener('click', async function() {
        // Button ko disable kar dein taake user dobara click na kar sake
        fetchButton.disabled = true;
        fetchButton.textContent = 'Fetching...';
        taskDisplay.style.display = 'none';

        try {
            // Apne Cloudflare Worker ko call karna
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Hum backend ko bata rahe hain ke 'fetch_task' ka action karna hai
                body: JSON.stringify({
                    action: 'fetch_task'
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Agar Cloudflare Worker ya GitHub API se error aaye
                throw new Error(result.message);
            }

            // Agar workflow kamyabi se trigger ho jaye
            alert(result.message);
            // Hum yahan task ka path display kar sakte hain, lekin abhi ke liye isay saada rakhte hain
            // taskPathElement.textContent = "A new task has been assigned to you. Please check the system.";
            // taskDisplay.style.display = 'block';

        } catch (error) {
            console.error('Error fetching task:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            // Chahe kamyab ho ya fail, button ko wapas aam haalat mein le aayein
            fetchButton.disabled = false;
            fetchButton.textContent = 'Fetch Next Task';
        }
    });
});

