window.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

window.sendRequest = async function(url, method, body = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.csrfToken,
            },
        };

        if (body) {
            options.body = body;
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            console.error('Server returned error', response.status);
            return false;
        }

        const data = await response.json();
        if (data.status === 'error') {
            console.error(`Server returned error: Status: ${data.status}, Message: ${data.message}`);
        }
        
        return data
    } catch (error) {
        console.error('Request failed:', error);
        return false;
    }
};

// Helper function for displaying toast messages
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { autohide: true, animation: true, delay: 3000 });
    bsToast.show();
};

// Set toast to show it after page load
window.queueToast = function(message, type = 'info') {
    sessionStorage.setItem('toastMessage', JSON.stringify({message: message, type: type}));
};