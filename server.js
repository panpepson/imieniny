const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// Middleware do dodawania nagłówków CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Zezwala na wszystkie źródła
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Funkcja do pobierania danych imienin z pliku CSV
const getNameDays = (day, month) => {
    const fileName = `${String(month).padStart(2, '0')}.csv`;
    const filePath = path.join(__dirname, 'data', fileName);

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
        for (const line of lines) {
            const [csvDay, nameDays] = line.split(';');
            if (csvDay.trim() === String(day)) {
                return nameDays.trim();
            }
        }
    } catch (err) {
        console.error(`Błąd podczas odczytu pliku ${fileName}:`, err);
    }

    return null;
};

// Endpoint API do pobierania imienin
app.get('/:date', (req, res) => {
    const { date } = req.params;
    const day = parseInt(date.slice(0, 2), 10);
    const month = parseInt(date.slice(2, 4), 10);

    const nameDays = getNameDays(day, month);

    if (nameDays) {
        res.json({ date: `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`, nameDays });
    } else {
        res.status(404).json({ error: 'Nie znaleziono imienin dla podanej daty' });
    }
});

// Uruchomienie serwera
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serwer API działa na porcie ${port}`);
});
