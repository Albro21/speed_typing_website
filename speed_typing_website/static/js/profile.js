document.getElementById('profilePictureInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const preview = document.getElementById('profilePicturePreview');
        preview.src = URL.createObjectURL(file);
    }
});

document.getElementById('settingsForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = await sendRequest('/users/profile/edit/', 'POST', formData);
    if (data.success) {
        window.location.reload();
    }
});
