document.addEventListener('DOMContentLoaded', function() {
    // ... (Tamam purane elements waisay hi)

    let currentTaskPath = null;
    let clientFolder = null; // Ab yeh dynamic hoga

    // Naya Function: Cookie se session data parhna
    function getSession() {
        const cookies = document.cookie.split('; ');
        const sessionCookie = cookies.find(row => row.startsWith('nexus_session='));
        if (!sessionCookie) return null;
        try {
            // Cookie ki value URL-decoded hoti hai, usay parse karna
            return JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]));
        } catch (e) {
            return null;
        }
    }

    const session = getSession();

    if (!session) {
        // Agar session nahi hai, to user ko login page par wapas bhej do
        alert("You are not logged in. Redirecting to login page.");
        window.location.href = '/index.html';
        return;
    } else {
        // Agar session hai, to client ka folder set kar do
        clientFolder = session.company_id;
        // Aap yahan par user ka naam bhi display karwa sakte hain
        // document.getElementById('usernameDisplay').textContent = session.username;
    }

    // ... (Tamam helper functions - triggerMainWorkflow, triggerAiQcWorkflow, etc. - ab clientFolder variable ka istemal karenge)

    // Example: triggerMainWorkflow ab aisa dikhega
    async function triggerMainWorkflow(action, payload = {}) {
        // ...
        try {
            const response = await fetch('/trigger-workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, client_folder: clientFolder, ...payload }) // Yahan dynamic variable istemal ho raha hai
            });
            // ...
        } catch (error) {
            // ...
        }
    }
    
    // ... (Baqi tamam file bilkul waisi hi rahegi)
});
