// Connection status checker
let connectionStatus = false;
let checkInterval;

async function checkServerConnection() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/test', {
            method: 'GET',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            if (!connectionStatus) {
                connectionStatus = true;
                if (typeof showToast === 'function') {
                    showToast('Server connection restored!', 'success');
                }
                console.log('✅ Server connected');
            }
        } else {
            throw new Error('Server responded with error');
        }
    } catch (error) {
        if (connectionStatus) {
            connectionStatus = false;
            if (typeof showToast === 'function') {
                showToast('Server connection lost. Retrying...', 'warning');
            }
            console.log('❌ Server disconnected');
        }
    }
}

// Start connection monitoring
function startConnectionMonitoring() {
    checkServerConnection(); // Initial check
    checkInterval = setInterval(checkServerConnection, 5000); // Check every 5 seconds
}

// Stop connection monitoring
function stopConnectionMonitoring() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
}

// Auto-start monitoring when script loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', startConnectionMonitoring);
    window.addEventListener('beforeunload', stopConnectionMonitoring);
}