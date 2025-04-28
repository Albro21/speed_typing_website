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