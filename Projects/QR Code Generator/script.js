document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    
    const qrInput = document.getElementById('qr-input');
    const fileInput = document.getElementById('file-input');
    
    const canvas = document.getElementById('qr-canvas');
    const placeholder = document.getElementById('qr-placeholder');
    const actionPanel = document.getElementById('action-panel');
    
    const fgColorInput = document.getElementById('fg-color');
    const bgColorInput = document.getElementById('bg-color');
    const downloadBtn = document.getElementById('download-btn');

    let qr = null;
    let currentDataValue = '';

    // Initialize QRious instance mapping onto our hidden canvas
    function initQR(value) {
        if (!value.trim()) {
            canvas.hidden = true;
            placeholder.hidden = false;
            actionPanel.hidden = true;
            return;
        }

        currentDataValue = value;
        canvas.hidden = false;
        placeholder.hidden = true;
        actionPanel.hidden = false;

        if (!qr) {
            qr = new QRious({
                element: canvas,
                value: value,
                size: 200,
                foreground: fgColorInput.value,
                background: bgColorInput.value,
                level: 'H' // High error correction
            });
        } else {
            qr.set({
                value: value,
                foreground: fgColorInput.value,
                background: bgColorInput.value
            });
        }
    }

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPanel = document.getElementById(`${btn.dataset.tab}-panel`);
            targetPanel.classList.add('active');
            
            // Re-render empty state or appropriate content
            if (btn.dataset.tab === 'text-link') {
                initQR(qrInput.value);
            } else {
                initQR(currentDataValue && fileInput.files.length ? currentDataValue : '');
            }
        });
    });

    // Text input monitoring
    qrInput.addEventListener('input', (e) => {
        initQR(e.target.value);
    });

    // File content parser (converts text/json file content directly to QR strings)
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            initQR(event.target.result);
        };
        reader.readAsText(file);
    });

    // Dynamic Color Customizations
    fgColorInput.addEventListener('input', () => {
        if (qr) qr.foreground = fgColorInput.value;
    });

    bgColorInput.addEventListener('input', () => {
        if (qr) qr.background = bgColorInput.value;
    });

    // Download Handler
    downloadBtn.addEventListener('click', () => {
        const imageURI = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = imageURI;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});