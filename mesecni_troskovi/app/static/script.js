let currentOsobaId = null;
let currentMonth = null;
let trosakiChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set current month as default
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('selectedMonth').value = `${year}-${month}`;
    currentMonth = `${year}-${month}`;

    // Load person data
    loadPersonData();

    // Load categories
    loadKategorije();

    // Setup event listeners
    document.getElementById('personForm').addEventListener('submit', handlePersonSubmit);
    document.getElementById('prihodForm').addEventListener('submit', handlePrihodSubmit);
    document.getElementById('trosakForm').addEventListener('submit', handleTrosakSubmit);
    document.getElementById('kategorijaForm').addEventListener('submit', handleKategorijaSubmit);

    // Load initial data
    loadMonthData();
});

// Load person data
function loadPersonData() {
    fetch('/api/osoba')
        .then(res => res.json())
        .then(data => {
            if (Object.keys(data).length > 0) {
                currentOsobaId = data.id;
                document.getElementById('ime').value = data.ime;
                document.getElementById('prezime').value = data.prezime;
                document.getElementById('datum_rodjenja').value = data.datum_rodjenja;
                
                if (data.slika) {
                    const imgContainer = document.getElementById('personImage');
                    const img = document.getElementById('displayImage');
                    img.src = `/app/uploads/${data.slika}`;
                    imgContainer.style.display = 'block';
                }
            }
        })
        .catch(err => console.error('Error loading person data:', err));
}

// Handle person form submission
function handlePersonSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('ime', document.getElementById('ime').value);
    formData.append('prezime', document.getElementById('prezime').value);
    formData.append('datum_rodjenja', document.getElementById('datum_rodjenja').value);
    
    const fileInput = document.getElementById('slika');
    if (fileInput.files.length > 0) {
        formData.append('slika', fileInput.files[0]);
    }

    fetch('/api/osoba', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            currentOsobaId = data.osoba_id;
            showAlert('Lični podaci su sačuvani!', 'success');
            loadPersonData();
        }
    })
    .catch(err => console.error('Error:', err));
}

// Load month data
function loadMonthData() {
    currentMonth = document.getElementById('selectedMonth').value;
    
    if (!currentOsobaId) {
        showAlert('Prvo unesite lične podatke', 'error');
        return;
    }

    loadPrihodi();
    loadTroskovi();
    loadIzvestaj();
}

// Load prihodi
function loadPrihodi() {
    fetch(`/api/prihodi/${currentOsobaId}/${currentMonth}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('prihodList');
            
            if (data.length === 0) {
                container.innerHTML = '<p class="empty-state">Nema prihoda za ovaj mesec</p>';
                document.getElementById('totalPrihodi').textContent = '0.00 дин';
                return;
            }

            let total = 0;
            container.innerHTML = data.map(prihod => {
                total += prihod.iznos;
                return `
                    <div class="list-item income">
                        <div class="list-item-content">
                            <div class="list-item-title">${prihod.naziv}</div>
                        </div>
                        <div class="list-item-amount">${prihod.iznos.toLocaleString('sr-RS', {minimumFractionDigits: 2})} дин</div>
                        <button class="btn btn-danger" onclick="deletePrihod(${prihod.id})">✕</button>
                    </div>
                `;
            }).join('');

            document.getElementById('totalPrihodi').textContent = 
                total.toLocaleString('sr-RS', {minimumFractionDigits: 2}) + ' дин';
            
            updateRazlika();
        })
        .catch(err => console.error('Error loading prihodi:', err));
}

// Load troškovi
function loadTroskovi() {
    fetch(`/api/troskovi/${currentOsobaId}/${currentMonth}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('trosakList');
            
            if (data.length === 0) {
                container.innerHTML = '<p class="empty-state">Nema troškova za ovaj mesec</p>';
                document.getElementById('totalTroskovi').textContent = '0.00 дин';
                return;
            }

            let total = 0;
            container.innerHTML = data.map(trosak => {
                total += trosak.iznos;
                return `
                    <div class="list-item expense" style="border-left-color: ${trosak.kategorija_boja}">
                        <div class="list-item-content">
                            <div class="list-item-title">${trosak.naziv}</div>
                            <div class="list-item-category">${trosak.kategorija}</div>
                            ${trosak.opis ? `<div style="font-size: 0.85em; color: #7f8c8d; margin-top: 3px;">${trosak.opis}</div>` : ''}
                        </div>
                        <div class="list-item-amount">${trosak.iznos.toLocaleString('sr-RS', {minimumFractionDigits: 2})} дин</div>
                        <button class="btn btn-danger" onclick="deleteTrosak(${trosak.id})">✕</button>
                    </div>
                `;
            }).join('');

            document.getElementById('totalTroskovi').textContent = 
                total.toLocaleString('sr-RS', {minimumFractionDigits: 2}) + ' дин';
            
            updateRazlika();
        })
        .catch(err => console.error('Error loading troskovi:', err));
}

// Load kategorije
function loadKategorije() {
    fetch('/api/kategorije')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('kategorija');
            select.innerHTML = '<option value="">Izaberite kategoriju</option>';
            data.forEach(kat => {
                const option = document.createElement('option');
                option.value = kat.id;
                option.textContent = kat.naziv;
                select.appendChild(option);
            });
        })
        .catch(err => console.error('Error loading kategorije:', err));
}

// Handle prihod submission
function handlePrihodSubmit(e) {
    e.preventDefault();

    const data = {
        naziv: document.getElementById('prihodNaziv').value,
        iznos: document.getElementById('prihodIznos').value
    };

    fetch(`/api/prihodi/${currentOsobaId}/${currentMonth}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showAlert('Prihod je dodan!', 'success');
            document.getElementById('prihodForm').reset();
            loadPrihodi();
            loadIzvestaj();
        }
    })
    .catch(err => console.error('Error:', err));
}

// Delete prihod
function deletePrihod(prihodId) {
    if (confirm('Da li ste sigurni?')) {
        fetch(`/api/prihod/${prihodId}`, {method: 'DELETE'})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAlert('Prihod je obrisan!', 'success');
                loadPrihodi();
                loadIzvestaj();
            }
        });
    }
}

// Handle trosak submission
function handleTrosakSubmit(e) {
    e.preventDefault();

    const data = {
        kategorija_id: document.getElementById('kategorija').value,
        naziv: document.getElementById('trosakNaziv').value,
        iznos: document.getElementById('trosakIznos').value,
        opis: document.getElementById('trosakOpis').value
    };

    if (!data.kategorija_id) {
        showAlert('Izaberite kategoriju!', 'error');
        return;
    }

    fetch(`/api/troskovi/${currentOsobaId}/${currentMonth}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showAlert('Trosak je dodan!', 'success');
            document.getElementById('trosakForm').reset();
            loadTroskovi();
            loadIzvestaj();
        }
    })
    .catch(err => console.error('Error:', err));
}

// Delete trosak
function deleteTrosak(trosakId) {
    if (confirm('Da li ste sigurni?')) {
        fetch(`/api/trosak/${trosakId}`, {method: 'DELETE'})
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showAlert('Trosak je obrisan!', 'success');
                loadTroskovi();
                loadIzvestaj();
            }
        });
    }
}

// Handle kategorija submission
function handleKategorijaSubmit(e) {
    e.preventDefault();

    const data = {
        naziv: document.getElementById('kategorijaNaziv').value,
        boja: document.getElementById('kategorijaBojaInput').value
    };

    fetch('/api/kategorije', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            showAlert('Kategorija je kreirana!', 'success');
            document.getElementById('kategorijaForm').reset();
            loadKategorije();
        } else {
            showAlert(result.message || 'Greška!', 'error');
        }
    })
    .catch(err => console.error('Error:', err));
}

// Load izvestaj
function loadIzvestaj() {
    fetch(`/api/izvestaj/${currentOsobaId}/${currentMonth}`)
        .then(res => res.json())
        .then(data => {
            // Update summary
            const totalPrihodi = data.total_prihodi;
            const totalTroskovi = data.total_troskovi;
            const razlika = data.razlika;

            document.getElementById('totalPrihodi').textContent = 
                totalPrihodi.toLocaleString('sr-RS', {minimumFractionDigits: 2}) + ' дин';
            document.getElementById('totalTroskovi').textContent = 
                totalTroskovi.toLocaleString('sr-RS', {minimumFractionDigits: 2}) + ' дин';
            document.getElementById('totalRazlika').textContent = 
                razlika.toLocaleString('sr-RS', {minimumFractionDigits: 2}) + ' дин';

            // Update balance card color
            const balanceCard = document.querySelector('.card-balance');
            if (razlika >= 0) {
                balanceCard.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            } else {
                balanceCard.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
            }

            // Update chart
            updateChart(data.troskovi_by_kategorija);

            // Update report table
            updateReportTable(data.troskovi_by_kategorija, totalTroskovi);
        })
        .catch(err => console.error('Error loading izvestaj:', err));
}

// Update chart
function updateChart(troskoviByKategorija) {
    const ctx = document.getElementById('trosakiChart');
    if (!ctx) return;

    const labels = Object.keys(troskoviByKategorija);
    const amounts = Object.values(troskoviByKategorija).map(t => t.iznos);
    const colors = Object.values(troskoviByKategorija).map(t => t.boja);

    if (trosakiChart) {
        trosakiChart.data.labels = labels;
        trosakiChart.data.datasets[0].data = amounts;
        trosakiChart.data.datasets[0].backgroundColor = colors;
        trosakiChart.update();
    } else {
        trosakiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {size: 12, weight: 'bold'}
                        }
                    }
                }
            }
        });
    }
}

// Update report table
function updateReportTable(troskoviByKategorija, total) {
    const tbody = document.getElementById('izvestajBody');
    
    if (Object.keys(troskoviByKategorija).length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state">Nema troškova za ovaj mesec</td></tr>';
        return;
    }

    tbody.innerHTML = Object.entries(troskoviByKategorija).map(([kategorija, data]) => `
        <tr>
            <td>
                <span style="display: inline-block; width: 15px; height: 15px; background-color: ${data.boja}; border-radius: 3px; margin-right: 8px;"></span>
                ${kategorija}
            </td>
            <td class="amount">${data.iznos.toLocaleString('sr-RS', {minimumFractionDigits: 2})} дин</td>
            <td class="percentage">${data.procentualno.toFixed(1)}%</td>
        </tr>
    `).join('');
}

// Update razlika
function updateRazlika() {
    const totalPrihodi = parseFloat(document.getElementById('totalPrihodi').textContent) || 0;
    const totalTroskovi = parseFloat(document.getElementById('totalTroskovi').textContent) || 0;
    const razlika = totalPrihodi - totalTroskovi;

    document.getElementById('totalRazlika').textContent = 
        razlika.toLocaleString('sr-RS', {minimumFractionDigits: 2}) + ' дин';
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Export PDF
function exportPDF() {
    if (!currentOsobaId) {
        showAlert('Prvo unesite lične podatke', 'error');
        return;
    }

    window.location.href = `/api/export-pdf/${currentOsobaId}/${currentMonth}`;
}

// Show alert
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.querySelector('.content').insertBefore(alert, document.querySelector('.summary-cards'));
    
    setTimeout(() => alert.remove(), 3000);
}
