const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

async function getAccessToken() {
    const url = 'https://login.bol.com/token';
    const credentials = Buffer.from(`${process.env.BOL_CLIENT_ID}:${process.env.BOL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    console.log('Access Token Response:', data); // DEBUGGING
    return data.access_token;
}

async function getVoorraad() {
    const accessToken = await getAccessToken();

    const response = await fetch('https://api.bol.com/retailer/offers', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.retailer.v10+json'
        }
    });

    const data = await response.json();
    console.log('Offers API Response:', data); // DEBUGGING
    return data;
}

app.get('/api/voorraad', async (req, res) => {
    try {
        const voorraadData = await getVoorraad();
        res.json(voorraadData);
    } catch (error) {
        console.error('Fout bij ophalen voorraad:', error);
        res.status(500).json({ error: 'Interne serverfout' });
    }
});

app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
