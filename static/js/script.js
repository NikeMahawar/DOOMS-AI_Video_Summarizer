document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const formatOptions = document.getElementById('formatOptions');
    const generateBtn = document.getElementById('generateBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBarFill = document.getElementById('progressBarFill');
    const loader = document.getElementById('loader');
    const timer = document.getElementById('timer');
    const statusMessage = document.getElementById('statusMessage');
    const timeRemaining = document.getElementById('timeRemaining');

    let videoName = '';
    let estimatedTime = 0;

    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('drag-over');
    }

    function unhighlight() {
        dropZone.classList.remove('drag-over');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFile(file);
    }

    fileInput.addEventListener('change', function(e) {
        handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file || !file.type.startsWith('video/')) {
            showStatus('Please upload a valid video file.', 'error');
            return;
        }

        if (file.size > 500 * 1024 * 1024) { // 500MB
            showStatus('File size must be less than 500MB.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        uploadFile(formData);
    }

    function uploadFile(formData) {
        showStatus('Uploading video...', 'info');

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            videoName = data.video_name;
            estimatedTime = data.estimated_time;
            showFormatOptions();
            showStatus('Video uploaded successfully!', 'success');
        })
        .catch(error => {
            showStatus(error.message || 'Error uploading video.', 'error');
        });
    }

    function showFormatOptions() {
        formatOptions.style.display = 'block';
        generateBtn.disabled = false;
        timeRemaining.textContent = `Estimated processing time: ${estimatedTime} seconds`;
    }

    document.querySelectorAll('input[name="format"]').forEach(radio => {
        radio.addEventListener('change', () => {
            generateBtn.disabled = false;
        });
    });

    generateBtn.addEventListener('click', function() {
        const format = document.querySelector('input[name="format"]:checked').value;
        processVideo(format);
    });

    function processVideo(format) {
        formatOptions.style.display = 'none';
        loader.style.display = 'block';

        let countdown = estimatedTime;
        updateTimer(countdown);

        const timerInterval = setInterval(() => {
            countdown--;
            updateTimer(countdown);
            if (countdown <= 0) clearInterval(timerInterval);
        }, 1000);

        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                video_name: videoName,
                format: format
            })
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(timerInterval);
            if (data.error) {
                throw new Error(data.error);
            }
            window.location.href = `/download/${data.file_path}`;
        })
        .catch(error => {
            clearInterval(timerInterval);
            loader.style.display = 'none';
            showStatus(error.message || 'Error processing video.', 'error');
        });
    }

    function updateTimer(seconds) {
        timer.textContent = `${seconds} seconds remaining`;
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
});