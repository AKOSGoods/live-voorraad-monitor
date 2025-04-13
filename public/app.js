async function fetchVoorraad() {
    const voorraadResponse = await fetch('/api/voorraad');
    const voorraadData = await voorraadResponse.json();

    const thuisResponse = await fetch('/api/thuisvoorraad');
    const thuisData = await thuisResponse.json();

    const voorraadContainer = document.getElementById('voorraad-container');
    voorraadContainer.innerHTML = '';

    const producten = voorraadData.offers || [];

    producten.forEach(offer => {
        const ean = offer.ean;
        const titel = offer.title || 'Geen titel';
        const bolVoorraad = offer.stockAmount || 0;
        const verkoop30Dagen = offer.fulfilmentDeliveryPromiseDays || 0; // Dummy want echte verkoopdata is pas met volledige API

        const thuisAantal = thuisData[ean] || 0;
        const totaalVoorraad = bolVoorraad + thuisAantal;
        const geschatteVerkoop = 2; // Dummy waarde
        const dagenVoorraad = geschatteVerkoop > 0 ? Math.floor(totaalVoorraad / geschatteVerkoop) : 999;

        let voorraadStatus = 'veilig';
        if (dagenVoorraad <= 10 || bolVoorraad <= 10) voorraadStatus = 'kritiek';
        else if (dagenVoorraad <= 15 || bolVoorraad <= 15) voorraadStatus = 'waarschuwing';

        const productDiv = document.createElement('div');
        productDiv.className = `product ${voorraadStatus}`;

        productDiv.innerHTML = `
            <h3>${titel}</h3>
            <p><strong>EAN:</strong> ${ean}</p>
            <p><strong>LVB-voorraad:</strong> ${bolVoorraad}</p>
            <p><strong>Thuisvoorraad:</strong> ${thuisAantal}</p>
            <p><strong>Totaal voorraad:</strong> ${totaalVoorraad}</p>
            <p><strong>Geschatte dagen voorraad:</strong> ${dagenVoorraad}</p>
            <input type="number" id="aanpassen-${ean}" placeholder="Thuisvoorraad aanpassen">
            <button onclick="aanpassenThuisVoorraad('${ean}')">Aanpassen</button>
            <input type="number" id="verzonden-${ean}" placeholder="Aantal verzonden naar LVB">
            <button onclick="verzondenNaarLVB('${ean}')">Verzonden naar LVB</button>
        `;

        voorraadContainer.appendChild(productDiv);
    });
}

async function aanpassenThuisVoorraad(ean) {
    const input = document.getElementById(`aanpassen-${ean}`);
    const aantal = parseInt(input.value);

    if (isNaN(aantal)) {
        alert('Voer een geldig aantal in.');
        return;
    }

    await fetch('/api/thuisvoorraad', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ean, aantal })
    });

    fetchVoorraad();
}

async function verzondenNaarLVB(ean) {
    const input = document.getElementById(`verzonden-${ean}`);
    const aantal = parseInt(input.value);

    if (isNaN(aantal)) {
        alert('Voer een geldig aantal in.');
        return;
    }

    await fetch('/api/verzonden-lvb', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verzonden: [{ ean, aantal }] })
    });

    fetchVoorraad();
}

// Sorteren knop
function sorteerVoorraad() {
    const voorraadContainer = document.getElementById('voorraad-container');
    const producten = Array.from(voorraadContainer.getElementsByClassName('product'));

    producten.sort((a, b) => {
        const aDagen = parseInt(a.querySelector('p:nth-child(6)').textContent.replace(/\D/g, '')) || 0;
        const bDagen = parseInt(b.querySelector('p:nth-child(6)').textContent.replace(/\D/g, '')) || 0;
        return aDagen - bDagen;
    });

    producten.forEach(p => voorraadContainer.appendChild(p));
}

fetchVoorraad();

