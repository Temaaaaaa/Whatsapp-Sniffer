// ----------------------------
//  Скрипт загружен
// ----------------------------
console.log('[injectMicTap.js загружен]');

// ----------------------------
// Перехватываем getUserMedia
// ----------------------------
navigator.mediaDevices.getUserMedia = (function (originalGetUserMedia) {
    return function (constraints) {
        console.log('[getUserMedia вызван]', constraints);

        return originalGetUserMedia.call(navigator.mediaDevices, constraints).then(stream => {
            if (constraints.audio && !constraints.video) {
                console.log('[Поток аудио перехвачен]');

                // Защита от повторной записи
                if (window._customRecorder?.state === 'recording') {
                    console.warn('[MediaRecorder уже активен]');
                    return stream;
                }

                const recorder = new MediaRecorder(stream);
                const audioChunks = [];
                window._customRecorder = recorder;

                // Сбор аудиоданных
                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                // Завершение записи
                recorder.onstop = () => {
                    console.log('[Запись остановлена]');
                    const blob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();

                    reader.onloadend = () => {
                        window.postMessage({
                            type: 'SAVE_MIC_AUDIO',
                            filename: 'mic_' + Date.now() + '.webm',
                            base64: reader.result
                        }, '*');
                        console.log('[Голосовое отправлено через postMessage]');
                    };

                    reader.readAsDataURL(blob);
                };

                // Обработка ошибок
                recorder.onerror = (e) => {
                    console.error('[MediaRecorder error]', e.error);
                };

                // Таймер на случай, если stop() не вызван
                setTimeout(() => {
                    if (recorder.state !== 'inactive') {
                        console.warn('[Таймер завершил запись вручную]');
                        recorder.stop();
                    }
                }, 60_000); // 60 секунд

                // Авто-остановка при завершении трека
                stream.getAudioTracks().forEach(track => {
                    track.addEventListener('ended', () => {
                        console.log('[Аудиопоток завершён]');
                        if (recorder.state !== 'inactive') {
                            recorder.stop();
                        }
                    });
                });

                // Старт записи
                recorder.start();
                console.log('[Запись началась]');
            }

            return stream;
        });
    };
})(navigator.mediaDevices.getUserMedia);
