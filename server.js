const fs = require('fs');               // Работа с файлами
const path = require('path');           // Построение путей
const os = require('os');               // Получение системной информации
const express = require('express');     // Веб-сервер
const app = express();                  // Создаём приложение Express

const PORT = 3131; // Порт, на котором будет работать сервер

// Разрешаем кросс-доменные запросы (CORS)
// Нужно, чтобы браузер (например WhatsApp Web) мог отправлять запросы к этому серверу
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // можно заменить на 'https://web.whatsapp.com' для большей безопасности
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Ответ на предварительный запрос браузера (preflight)
app.options('/upload', (req, res) => {
    res.sendStatus(200); // Просто говорим "да, можно"
});

//  Обработка  тела запроса (до 50 МБ)
app.use(express.json({ limit: '50mb' }));

// Обработка загрузки файлов
app.post('/upload', (req, res) => {
    const { filename, base64 } = req.body;

    // очищаем base64-строку от мусора
    const pureBase64 = base64.split(';base64,').pop();

    //  Путь к папке сохранения: Рабочий стол / WhatsAppCaptures
    const desktopFolder = path.join(os.homedir(), 'Desktop');
    const saveFolder = path.join(desktopFolder, 'WhatsAppCaptures');

    //  Создаём папку, если её нет
    if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
    }

    //  куда сохраняем файл
    const fullPath = path.join(saveFolder, filename);

    // запись файла на диск
    fs.writeFile(fullPath, Buffer.from(pureBase64, 'base64'), (err) => {
        if (err) {
            console.error('Ошибка при сохранении файла:', err);
            return res.status(500).send('Ошибка при сохранении файла');
        }

        console.log(`Файл сохранён: ${filename}`);
        res.send('Файл успешно сохранён');
    });
});

// запуск
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});



