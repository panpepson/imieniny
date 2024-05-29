const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 3030;

function getNameDays(month, day) {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, 'data', `${month}.csv`);

        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' }))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const entry = results.find(row => parseInt(row.data) === day);
                if (entry) {
                    resolve(entry.imieniny);
                } else {
                    reject('Name day not found');
                }
            })
            .on('error', reject);
    });
}

app.get('/:date', async (req, res) => {
    const dateStr = req.params.date;

    if (dateStr.length !== 6) {
        return res.status(400).send('Invalid date format. Use DDMMYY.');
    }

    const day = parseInt(dateStr.substring(0, 2), 10);
    const month = dateStr.substring(2, 4);

    if (isNaN(day) || parseInt(month) < 1 || parseInt(month) > 12) {
        return res.status(400).send('Invalid date.');
    }

    try {
        const nameDays = await getNameDays(month, day);
        res.send({ date: `${day}-${month}`, nameDays });
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

