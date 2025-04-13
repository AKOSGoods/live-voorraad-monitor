const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const clientId = process.env.BOL_CLIENT_ID;
const clientSecret = process.env.BOL_CLIENT_SECRET;

async function getAccessToken() {
    const response = await fetch('https://login.bol.com/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    const data = await response.json();
    return data.access_token;
}

app.get('/api/voorraad', async (req, res) => {
    try {
        const token = await getAccessToken();
        const voorraadResponse = await fetch('https://api.bol.com/retailer/insights/stock', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.retailer.v10+json'
            }
        });
        const voorraadData = await voorraadResponse.json();
        res.json(voorraadData);
    } catch (error) {
        console.error('Fout bij ophalen voorraad:', error);
        res.status(500).json({ error: 'Probleem bij ophalen voorraad.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
