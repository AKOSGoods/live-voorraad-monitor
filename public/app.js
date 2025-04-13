async function laadVoorraad() {
    const container = document.getElementById('voorraad-container');
    container.innerHTML = '<p>Voorraadgegevens worden geladen...</p>';

    try {
        const response = await fetch('/api/voorraad');
        const data = await response.json();

        container.innerHTML = '';

        if (!data || !data.products || data.products.length === 0) {
            container.innerHTML = '<p>Geen voorraadgegevens gevonden.</p>';
            return;
        }

        data.products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');

            const voorraadDagen = product.forecastDays || 0;

            if (voorraadDagen < 10) {
                productDiv.classList.add('critical');
            } else if (voorraadDagen < 20) {
                productDiv.classList.add('warning');
            } else {
                productDiv.classList.add('safe');
            }

            productDiv.innerHTML = `
                <h2>${product.name}</h2>
                <p>EAN: ${product.ean}</p>
                <p>Huidige voorraad: ${product.stock}</p>
                <p>Geschatte verkoop komende 28 dagen: ${product.salesForecast}</p>
                <p>Voorraad dagen: ${voorraadDagen}</p>
            `;

            container.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Fout bij laden voorraad:', error);
        container.innerHTML = '<p>Er is een fout opgetreden bij het laden van de voorraad.</p>';
    }
}

document.addEventListener('DOMContentLoaded', laadVoorraad);
