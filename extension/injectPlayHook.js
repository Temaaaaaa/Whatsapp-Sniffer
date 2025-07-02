(function interceptAudioPlay() {
    const originalPlay = HTMLAudioElement.prototype.play;

    HTMLAudioElement.prototype.play = function (...args) {
        if (this.src?.startsWith('blob:')) {
            console.log('[Воспроизведение audio]', this.src);

            try {
                fetch(this.src)
                    .then(r => r.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            window.postMessage({
                                type: 'SAVE_MIC_AUDIO',
                                filename: 'played_' + Date.now() + '.ogg',
                                base64: reader.result
                            }, '*');
                        };
                        reader.readAsDataURL(blob);
                    });
            } catch (err) {
                console.error('[Ошибка извлечения голосового]', err);
            }
        }

        return originalPlay.apply(this, args);
    };
})();
