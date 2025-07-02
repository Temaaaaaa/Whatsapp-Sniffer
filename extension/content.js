function convertFileToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
}

function uploadBase64ToServer(filename, base64) {
    fetch('http://localhost:3131/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, base64 })
    }).catch(console.error);
}

function processFiles(fileList) {
    const files = Array.from(fileList);
    files.forEach(file => {
        convertFileToBase64(file, base64 => {
            uploadBase64ToServer(file.name, base64);
        });
    });
}

//  paste
    document.addEventListener('paste', event => {
        const target = event.target;
    
        const isInChatArea = target instanceof HTMLElement &&
            target.closest('div.copyable-area');
    
        if (
            isInChatArea &&
            event.clipboardData?.files?.length > 0
        ) {
            processFiles(event.clipboardData.files);
        }
    }, true);


// drop
document.addEventListener('drop', event => {
    const target = event.target;

    const isInChatArea = target instanceof HTMLElement &&
        target.closest('div.copyable-area');

    if (
        isInChatArea &&
        event.dataTransfer?.files?.length > 0
    ) {
        processFiles(event.dataTransfer.files);
    }
}, true);



//  input[type=file]
document.addEventListener('change', event => {
    const el = event.target;
    if (el.tagName === 'INPUT' && el.type === 'file') {
        processFiles(el.files);
    }
}, true);

// Перехват голосовых из микрофона / воспроизведения
const micScript = document.createElement('script');
micScript.src = chrome.runtime.getURL('injectMicTap.js');
(document.head || document.documentElement).appendChild(micScript);


document.addEventListener('click', (e) => {
    const isDownloadAnchor = e.target.closest('a[download][href^="blob:"]');
    if (isDownloadAnchor) {
        console.log('[⬇ Клик по ссылке blob: для скачивания]', isDownloadAnchor.download);

        const url = isDownloadAnchor.href;
        fetch(url)
            .then(r => r.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    fetch('http://localhost:3131/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: isDownloadAnchor.download || ('downloaded_' + Date.now() + '.ogg'),
                            base64: reader.result
                        })
                    }).catch(console.error);
                };
                reader.readAsDataURL(blob);
            }).catch(console.error);
    }
}, true);

window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    if (event.data.type === 'SAVE_MIC_AUDIO') {
        fetch('http://localhost:3131/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: event.data.filename,
                base64: event.data.base64
            })
        }).catch(error => console.error('[upload error]', error));
    }
});


const playScript = document.createElement('script');
playScript.src = chrome.runtime.getURL('injectPlayHook.js');
(document.head || document.documentElement).appendChild(playScript);