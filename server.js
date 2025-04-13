const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let thuisVoorraad = {}; // Handmatige thuisvoorraad per EAN

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
    console.log('Access Token Response:', data);
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
    console.log('Offers API Response:', data);
    return data;
}

// API endpoint: Ophalen live voorraad
app.get('/api/voorraad', async (req, res) => {
    try {
        const voorraadData = await getVoorraad();
        res.json(voorraadData);
    } catch (error) {
        console.error('Fout bij ophalen voorraad:', error);
        res.status(500).json({ error: 'Interne serverfout' });
    }
});

// API endpoint: Aanpassen thuisvoorraad
app.use(express.json());

app.post('/api/thuisvoorraad', (req, res) => {
    const { ean, aantal } = req.body;
    thuisVoorraad[ean] = (thuisVoorraad[ean] || 0) + aantal;
    console.log(`Thuisvoorraad aangepast: ${ean} = ${thuisVoorraad[ean]}`);
    res.json({ success: true });
});

// API endpoint: Ophalen thuisvoorraad
app.get('/api/thuisvoorraad', (req, res) => {
    res.json(thuisVoorraad);
});

// API endpoint: Verwerken verzending naar LVB
app.post('/api/verzonden-lvb', (req, res) => {
    const { verzonden } = req.body;
    verzonden.forEach(item => {
        if (thuisVoorraad[item.ean]) {
            thuisVoorraad[item.ean] -= item.aantal;
            if (thuisVoorraad[item.ean] < 0) thuisVoorraad[item.ean] = 0;
        }
    });
    console.log('Verzonden naar LVB verwerkt:', verzonden);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
