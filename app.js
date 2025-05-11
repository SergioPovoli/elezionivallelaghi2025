// Global variables
let preferenzeData, risultatiData;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Load data
    Promise.all([
        fetch('https://github.com/SergioPovoli/elezionivallelaghi2025/blob/main/data/preferenze_2025.csv').then(response => response.text()),
        fetch('https://github.com/SergioPovoli/elezionivallelaghi2025/blob/main/data/risultati_liste_vallelaghi_2025.csv').then(response => response.text())
    ]).then(([preferenzeCSV, risultatiCSV]) => {
        preferenzeData = parseCSV(preferenzeCSV);
        risultatiData = parseCSV(risultatiCSV);

        // Initialize tabs
        initOverviewTab();
        initCandidatesTab();
        initTerritoryTab();
        initDataTab();

        // Show first tab content
        document.querySelector('#overview-tab').click();
    }).catch(error => {
        console.error('Error loading data:', error);
        showError('Errore nel caricamento dei dati. Si prega di ricaricare la pagina.');
    });
});

function showError(message) {
    const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    document.querySelector('.container').insertAdjacentHTML('afterbegin', alertHTML);
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j] ? currentline[j].trim() : '';
        }

        result.push(obj);
    }

    return result;
}

// ================= CHART CREATION FUNCTIONS ================= //

function createBarChart(canvasId, data, labelField, valueField, customOptions = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const defaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.parsed.y.toLocaleString()} voti`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString();
                    }
                }
            }
        }
    };

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item[labelField]),
            datasets: [{
                data: data.map(item => parseInt(item[valueField])),
                backgroundColor: data.map(item =>
                    item.Voce === 'FUTURO VALLELAGHI' ? 'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)'
                ),
                borderColor: 'rgba(8, 48, 107, 1)',
                borderWidth: 1.5
            }]
        },
        options: { ...defaults, ...customOptions }
    });
}

function createPieChart(canvasId, data, labelField, valueField) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item[labelField]),
            datasets: [{
                data: data.map(item => parseInt(item[valueField])),
                backgroundColor: data.map(item =>
                    item.Voce === 'FUTURO VALLELAGHI' ? 'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)'
                ),
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toLocaleString()} voti (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createGroupedBarChart(canvasId, locationData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const locations = locationData.map(item => item.location);

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [
                {
                    label: 'PROGETTO VALLELAGHI',
                    data: locationData.map(item => item['PROGETTO VALLELAGHI']),
                    backgroundColor: 'rgba(31, 119, 180, 0.8)',
                    borderColor: 'rgba(31, 119, 180, 1)',
                    borderWidth: 1
                },
                {
                    label: 'FUTURO VALLELAGHI',
                    data: locationData.map(item => item['FUTURO VALLELAGHI']),
                    backgroundColor: 'rgba(255, 127, 14, 0.8)',
                    borderColor: 'rgba(255, 127, 14, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} voti`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function createCouncilChart(canvasId, councilMembers) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: councilMembers.map(member => member.Candidato),
            datasets: [{
                label: 'Voti',
                data: councilMembers.map(member => member.Totale),
                backgroundColor: councilMembers.map(member =>
                    member.Lista === 'FUTURO VALLELAGHI' ? 'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)'
                ),
                borderColor: 'rgba(8, 48, 107, 1)',
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            return context[0].label;
                        },
                        label: function (context) {
                            const member = councilMembers[context.dataIndex];
                            return [
                                `Lista: ${member.Lista}`,
                                `Voti: ${context.parsed.x.toLocaleString()}`,
                                `Posizione: ${member.Posizione}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ================= TAB INITIALIZATION FUNCTIONS ================= //

function initOverviewTab() {
    const tabContent = document.querySelector('#overview');

    // Overall results
    const overallResults = risultatiData.filter(row =>
        row.Voce === 'FUTURO VALLELAGHI' || row.Voce === 'PROGETTO VALLELAGHI'
    );

    const html_2 = `
        <h2 class="mb-4">Riepilogo Risultati</h2>
        
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">Risultato Complessivo</div>
                    <div class="card-body">
                        <div class="chart-container" style="height: 400px;">
                            <canvas id="overallResultsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">Distribuzione Percentuale</div>
                    <div class="card-body">
                        <div class="chart-container" style="height: 400px;">
                            <canvas id="percentagePieChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">Risultati per Località</div>
            <div class="card-body">
                <div class="chart-container" style="height: 400px;">
                    <canvas id="locationResultsChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">Composizione Consiglio Comunale</div>
            <div class="card-body">
                <div class="chart-container" style="height: 500px;">
                    <canvas id="councilCompositionChart"></canvas>
                </div>
                <p class="text-muted mt-2">
                    Oltre al sindaco Lorenzo Miori e al candidato sindaco della lista FUTURO VALLELAGHI
                </p>
                <button class="btn btn-sm btn-outline-primary mt-2" data-bs-toggle="collapse" data-bs-target="#councilTable">
                    Mostra elenco completo
                </button>
                <div class="collapse mt-2" id="councilTable">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover" id="councilMembersTable">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Lista</th>
                                    <th>Voti totali</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    tabContent.innerHTML = html_2;

    // Create charts
    createBarChart('overallResultsChart', overallResults, 'Voce', 'TOTALE', {
        plugins: {
            title: {
                display: true,
                text: 'Risultato Complessivo',
                font: { size: 16 }
            }
        }
    });

    createPieChart('percentagePieChart', overallResults, 'Voce', 'TOTALE');

    // Location results chart
    const locationData = prepareLocationData();
    createGroupedBarChart('locationResultsChart', locationData);

    // Council composition
    const councilMembers = prepareCouncilData();
    createCouncilChart('councilCompositionChart', councilMembers);
    populateCouncilTable(councilMembers);
}

function prepareLocationData() {
    const locations = ['VEZZANO', 'RANZO', 'PADERGNONE', 'TERLAGO', 'COVELO'];
    const result = [];

    const progetto = risultatiData.find(row => row.Voce === 'PROGETTO VALLELAGHI');
    const futuro = risultatiData.find(row => row.Voce === 'FUTURO VALLELAGHI');

    locations.forEach(location => {
        result.push({
            location: location,
            'PROGETTO VALLELAGHI': parseInt(progetto[location]),
            'FUTURO VALLELAGHI': parseInt(futuro[location])
        });
    });

    return result;
}

function prepareCouncilData() {
    // Filter and sort candidates
    const progetto = preferenzeData
        .filter(row => row.Lista === 'PROGETTO VALLELAGHI')
        .sort((a, b) => parseInt(b.Totale) - parseInt(a.Totale))
        .slice(0, 11);

    const futuro = preferenzeData
        .filter(row => row.Lista === 'FUTURO VALLELAGHI')
        .sort((a, b) => parseInt(b.Totale) - parseInt(a.Totale))
        .slice(0, 5);

    // Combine and add position info
    return [...progetto, ...futuro]
        .sort((a, b) => parseInt(b.Totale) - parseInt(a.Totale))
        .map(member => ({
            ...member,
            Totale: parseInt(member.Totale),
            Posizione: `Consigliere (${member.Lista})`
        }));
}

function populateCouncilTable(councilMembers) {
    const tbody = document.querySelector('#councilMembersTable tbody');
    tbody.innerHTML = '';

    councilMembers.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.Candidato}</td>
            <td><span class="badge" style="background-color: ${member.Lista === 'FUTURO VALLELAGHI' ? 'var(--futuro-color)' : 'var(--progetto-color)'
            }">${member.Lista}</span></td>
            <td>${member.Totale.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
}

// Stub functions for other tabs (to be implemented)
function initCandidatesTab() {
    const tabContent = document.querySelector('#candidates');

    const html_cand = `
        <h2 class="mb-4">Analisi dei Candidati</h2>
        
        <div class="card mb-4">
            <div class="card-header">Filtri</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="listFilter" class="form-label">Seleziona lista</label>
                        <select class="form-select" id="listFilter">
                            <option value="all">Tutte le liste</option>
                            <option value="PROGETTO VALLELAGHI">PROGETTO VALLELAGHI</option>
                            <option value="FUTURO VALLELAGHI">FUTURO VALLELAGHI</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="metric-card">
                    <div class="metric-value" id="totalCandidates">0</div>
                    <div class="metric-label">Candidati totali</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="metric-card">
                    <div class="metric-value" id="avgVotes">0</div>
                    <div class="metric-label">Voti medi</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="metric-card">
                    <div class="metric-value" id="maxVotes">0</div>
                    <div class="metric-label">Massimo voti</div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">Classifica candidati</div>
            <div class="card-body">
                <div class="chart-container" style="height: 500px;">
                    <canvas id="candidatesChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">Dettaglio candidato</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="candidateSelect" class="form-label">Seleziona un candidato</label>
                        <select class="form-select" id="candidateSelect">
                            <option value="">-- Seleziona --</option>
                        </select>
                    </div>
                </div>
                
                <div id="candidateDetail" class="mt-4" style="display: none;">
                    <div class="row">
                        <div class="col-md-4">
                            <h4 id="candidateName"></h4>
                            <p><strong>Lista:</strong> <span id="candidateList" class="badge"></span></p>
                            <p><strong>Voti totali:</strong> <span id="candidateTotalVotes"></span></p>
                            <p><strong>% preferenze lista:</strong> <span id="candidateListPercentage"></span></p>
                        </div>
                        <div class="col-md-8">
                            <div class="chart-container" style="height: 300px;">
                                <canvas id="candidateLocationChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">Confronto tra candidati</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="compareCandidate1" class="form-label">Primo candidato</label>
                        <select class="form-select" id="compareCandidate1">
                            <option value="">-- Seleziona --</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="compareCandidate2" class="form-label">Secondo candidato</label>
                        <select class="form-select" id="compareCandidate2">
                            <option value="">-- Seleziona --</option>
                        </select>
                    </div>
                </div>
                
                <div id="candidateComparison" class="mt-4" style="display: none;">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h5 id="compareName1"></h5>
                            <p><strong>Lista:</strong> <span id="compareList1" class="badge"></span></p>
                            <p><strong>Voti totali:</strong> <span id="compareTotal1"></span></p>
                        </div>
                        <div class="col-md-6">
                            <h5 id="compareName2"></h5>
                            <p><strong>Lista:</strong> <span id="compareList2" class="badge"></span></p>
                            <p><strong>Voti totali:</strong> <span id="compareTotal2"></span></p>
                        </div>
                    </div>
                    
                    <div class="chart-container" style="height: 400px;">
                        <canvas id="comparisonChart"></canvas>
                    </div>
                    
                    <div class="mt-4">
                        <button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#comparisonTable">
                            Mostra dettaglio per località
                        </button>
                        <div class="collapse mt-2" id="comparisonTable">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="comparisonDataTable">
                                    <thead>
                                        <tr>
                                            <th>Località</th>
                                            <th>Differenza voti</th>
                                            <th>Vantaggio</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;


    tabContent.innerHTML = html_cand;

    // Initialize the tab functionality
    setupCandidatesTab();
}

function setupCandidatesTab() {
    // Get all unique candidates
    const allCandidates = [...new Set(preferenzeData.map(item => item.Candidato))].sort();

    // Populate candidate selectors
    const candidateSelect = document.getElementById('candidateSelect');
    const compareSelect1 = document.getElementById('compareCandidate1');
    const compareSelect2 = document.getElementById('compareCandidate2');

    allCandidates.forEach(candidate => {
        const option = document.createElement('option');
        option.value = candidate;
        option.textContent = candidate;

        candidateSelect.appendChild(option.cloneNode(true));
        compareSelect1.appendChild(option.cloneNode(true));
        compareSelect2.appendChild(option);
    });

    // Set up list filter
    const listFilter = document.getElementById('listFilter');
    listFilter.addEventListener('change', updateCandidatesView);

    // Set up candidate select
    candidateSelect.addEventListener('change', showCandidateDetail);

    // Set up comparison selects
    compareSelect1.addEventListener('change', updateComparison);
    compareSelect2.addEventListener('change', updateComparison);

    // Initial view update
    updateCandidatesView();
}

function updateCandidatesView() {
    const listFilter = document.getElementById('listFilter').value;
    let filteredCandidates;

    if (listFilter === 'all') {
        filteredCandidates = preferenzeData;
    } else {
        filteredCandidates = preferenzeData.filter(candidate => candidate.Lista === listFilter);
    }

    // Update metrics
    document.getElementById('totalCandidates').textContent = filteredCandidates.length;

    const avgVotes = Math.round(filteredCandidates.reduce((sum, candidate) =>
        sum + parseInt(candidate.Totale), 0) / filteredCandidates.length);
    document.getElementById('avgVotes').textContent = avgVotes.toLocaleString();

    const maxVotes = Math.max(...filteredCandidates.map(candidate => parseInt(candidate.Totale)));
    document.getElementById('maxVotes').textContent = maxVotes.toLocaleString();

    // Sort by total votes
    const sortedCandidates = [...filteredCandidates].sort((a, b) =>
        parseInt(b.Totale) - parseInt(a.Totale));

    // Update candidates chart
    updateCandidatesChart(sortedCandidates);

    // Update candidate select options
    updateCandidateSelectOptions(sortedCandidates);
}

function updateCandidatesChart(candidates) {
    const ctx = document.getElementById('candidatesChart').getContext('2d');

    // Destroy previous chart if it exists
    if (window.candidatesChart instanceof Chart) {
        window.candidatesChart.destroy();
    }

    // Show top 20 candidates
    const topCandidates = candidates.slice(0, 20);

    window.candidatesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topCandidates.map(c => c.Candidato),
            datasets: [{
                label: 'Voti',
                data: topCandidates.map(c => parseInt(c.Totale)),
                backgroundColor: topCandidates.map(c =>
                    c.Lista === 'FUTURO VALLELAGHI' ? 'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)'
                ),
                borderColor: 'rgba(8, 48, 107, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.parsed.x.toLocaleString()} voti`;
                        },
                        afterLabel: function (context) {
                            const candidate = candidates[context.dataIndex];
                            return `Lista: ${candidate.Lista}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function updateCandidateSelectOptions(candidates) {
    const candidateSelect = document.getElementById('candidateSelect');
    const compareSelect1 = document.getElementById('compareCandidate1');
    const compareSelect2 = document.getElementById('compareCandidate2');

    // Clear existing options (keep first empty option)
    while (candidateSelect.options.length > 1) candidateSelect.remove(1);
    while (compareSelect1.options.length > 1) compareSelect1.remove(1);
    while (compareSelect2.options.length > 1) compareSelect2.remove(1);

    // Add new options
    candidates.forEach(candidate => {
        const option = document.createElement('option');
        option.value = candidate.Candidato;
        option.textContent = candidate.Candidato;

        candidateSelect.appendChild(option.cloneNode(true));
        compareSelect1.appendChild(option.cloneNode(true));
        compareSelect2.appendChild(option.cloneNode(true));
    });
}

function showCandidateDetail() {
    const candidateName = document.getElementById('candidateSelect').value;
    if (!candidateName) {
        document.getElementById('candidateDetail').style.display = 'none';
        return;
    }

    const candidate = preferenzeData.find(c => c.Candidato === candidateName);
    if (!candidate) return;

    // Update candidate info
    document.getElementById('candidateName').textContent = candidate.Candidato;

    const listBadge = document.getElementById('candidateList');
    listBadge.textContent = candidate.Lista;
    listBadge.className = 'badge';
    listBadge.style.backgroundColor = candidate.Lista === 'FUTURO VALLELAGHI' ?
        'var(--futuro-color)' : 'var(--progetto-color)';

    document.getElementById('candidateTotalVotes').textContent =
        parseInt(candidate.Totale).toLocaleString();

    // Calculate percentage of list votes
    const listTotal = preferenzeData
        .filter(c => c.Lista === candidate.Lista)
        .reduce((sum, c) => sum + parseInt(c.Totale), 0);
    const percentage = ((parseInt(candidate.Totale) / listTotal * 100).toFixed(1));
    document.getElementById('candidateListPercentage').textContent = `${percentage}%`;

    // Show candidate location distribution
    updateCandidateLocationChart(candidate);

    // Show the detail section
    document.getElementById('candidateDetail').style.display = 'block';
}

function updateCandidateLocationChart(candidate) {
    const ctx = document.getElementById('candidateLocationChart').getContext('2d');

    // Destroy previous chart if it exists
    if (window.candidateLocationChart instanceof Chart) {
        window.candidateLocationChart.destroy();
    }

    // Get location columns (exclude metadata columns)
    const locations = Object.keys(candidate).filter(key =>
        !['index', 'Candidato', 'Lista', 'Totale'].includes(key));

    const locationData = locations.map(loc => ({
        location: loc,
        votes: parseInt(candidate[loc]),
        percentage: ((parseInt(candidate[loc]) / parseInt(candidate.Totale) * 100).toFixed(1))
    })).sort((a, b) => b.votes - a.votes);

    window.candidateLocationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locationData.map(d => d.location),
            datasets: [{
                label: 'Voti',
                data: locationData.map(d => d.votes),
                backgroundColor: candidate.Lista === 'FUTURO VALLELAGHI' ?
                    'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)',
                borderColor: 'rgba(8, 48, 107, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const data = locationData[context.dataIndex];
                            return [
                                `Voti: ${data.votes.toLocaleString()}`,
                                `% del totale candidato: ${data.percentage}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function updateComparison() {
    const candidate1 = document.getElementById('compareCandidate1').value;
    const candidate2 = document.getElementById('compareCandidate2').value;

    if (!candidate1 || !candidate2) {
        document.getElementById('candidateComparison').style.display = 'none';
        return;
    }

    const cand1Data = preferenzeData.find(c => c.Candidato === candidate1);
    const cand2Data = preferenzeData.find(c => c.Candidato === candidate2);

    console.log(cand1Data)

    delete cand1Data["index"];
    delete cand1Data[""];

    delete cand2Data["index"];
    delete cand2Data[""];

    if (!cand1Data || !cand2Data) return;
    

    document.getElementById('compareName1').textContent = cand1Data.Candidato;
    document.getElementById('compareName2').textContent = cand2Data.Candidato;

    const listBadge1 = document.getElementById('compareList1');
    listBadge1.textContent = cand1Data.Lista;
    listBadge1.className = 'badge';
    listBadge1.style.backgroundColor = cand1Data.Lista === 'FUTURO VALLELAGHI' ?
        'var(--futuro-color)' : 'var(--progetto-color)';

    const listBadge2 = document.getElementById('compareList2');
    listBadge2.textContent = cand2Data.Lista;
    listBadge2.className = 'badge';
    listBadge2.style.backgroundColor = cand2Data.Lista === 'FUTURO VALLELAGHI' ?
        'var(--futuro-color)' : 'var(--progetto-color)';

    document.getElementById('compareTotal1').textContent =
        parseInt(cand1Data.Totale).toLocaleString();
    document.getElementById('compareTotal2').textContent =
        parseInt(cand2Data.Totale).toLocaleString();

    // Update comparison chart
    updateComparisonChart(cand1Data, cand2Data);

    // Update comparison table
    updateComparisonTable(cand1Data, cand2Data);

    // Show the comparison section
    document.getElementById('candidateComparison').style.display = 'block';
}

function updateComparisonChart(cand1, cand2) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    // Destroy previous chart if it exists
    if (window.comparisonChart instanceof Chart) {
        window.comparisonChart.destroy();
    }

    // Get location columns (exclude metadata columns)
    const locations = Object.keys(cand1).filter(key =>
        !['index', 'Candidato', 'Lista', 'Totale'].includes(key));

    // Prepare data
    const cand1Color = cand1.Lista === 'FUTURO VALLELAGHI' ?
        'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)';
    const cand2Color = cand2.Lista === 'FUTURO VALLELAGHI' ?
        'rgba(255, 140, 7, 0.8)' : 'rgba(100, 149, 237, 0.8)';

    window.comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [
                {
                    label: cand1.Candidato,
                    data: locations.map(loc => parseInt(cand1[loc])),
                    backgroundColor: cand1Color,
                    borderColor: darkenColor(cand1Color),
                    borderWidth: 1
                },
                {
                    label: cand2.Candidato,
                    data: locations.map(loc => parseInt(cand2[loc])),
                    backgroundColor: cand2Color,
                    borderColor: darkenColor(cand2Color),
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} voti`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function updateComparisonTable(cand1, cand2) {
    const tbody = document.querySelector('#comparisonDataTable tbody');
    tbody.innerHTML = '';

    // Get location columns (exclude metadata columns)
    const locations = Object.keys(cand1).filter(key =>
        !['index', 'Candidato', 'Lista', 'Totale'].includes(key));

    locations.forEach(loc => {
        const cand1Votes = parseInt(cand1[loc]);
        const cand2Votes = parseInt(cand2[loc]);
        const diff = Math.abs(cand1Votes - cand2Votes);
        const advantage = cand1Votes > cand2Votes ? cand1.Candidato :
            (cand2Votes > cand1Votes ? cand2.Candidato : 'Pareggio');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${loc}</td>
            <td>${diff.toLocaleString()}</td>
            <td>${advantage}</td>
        `;
        tbody.appendChild(row);
    });
}

function darkenColor(color) {
    // Simple function to darken a color for borders
    return color.replace('0.8)', '1)');
}

function initTerritoryTab() {
    const tabContent = document.querySelector('#territory');
    
    const html = `
        <h2 class="mb-4">Analisi Territoriale</h2>
        
        <div class="card mb-4">
            <div class="card-header">Filtri</div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <label for="locationSelect" class="form-label">Seleziona Seggio</label>
                        <select class="form-select" id="locationSelect">
                            <option value="">-- Seleziona --</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="locationAnalysisContent" style="display: none;">
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="metric-card">
                        <div class="metric-value" id="totalVotesLocation">0</div>
                        <div class="metric-label">Voti totali seggio</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="metric-card">
                        <div class="metric-value" id="percentFuturo">0%</div>
                        <div class="metric-label">% FUTURO VALLELAGHI</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="metric-card">
                        <div class="metric-value" id="percentProgetto">0%</div>
                        <div class="metric-label">% PROGETTO VALLELAGHI</div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card h-100">
                        <div class="card-header">Distribuzione voti</div>
                        <div class="card-body">
                            <div class="chart-container" style="height: 300px;">
                                <canvas id="locationResultsChart_1"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header">Candidati più votati</div>
                <div class="card-body">
                    <div class="chart-container" style="height: 400px;">
                        <canvas id="topCandidatesChart"></canvas>
                    </div>
                    <button class="btn btn-sm btn-outline-primary mt-3" data-bs-toggle="collapse" data-bs-target="#topCandidatesTable">
                        Mostra dettagli candidati
                    </button>
                    <div class="collapse mt-2" id="topCandidatesTable">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="topCandidatesDataTable">
                                <thead>
                                    <tr>
                                        <th>Candidato</th>
                                        <th>Lista</th>
                                        <th>Voti</th>
                                        <th>% Voti</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
    `;
    
    tabContent.innerHTML = html;
    
    // Initialize the tab functionality
    setupTerritoryTab();
}

function setupTerritoryTab() {
    // Get available locations (sezioni)
    const locations = ['VEZZANO', 'RANZO', 'PADERGNONE', 'TERLAGO', 'COVELO'];
    const locationSelect = document.getElementById('locationSelect');
    
    // Populate location dropdown
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
    
    // Set up event listener
    locationSelect.addEventListener('change', updateTerritoryAnalysis);
}

function updateTerritoryAnalysis() {
    const location = document.getElementById('locationSelect').value;
    const contentDiv = document.getElementById('locationAnalysisContent');
    
    if (!location) {
        contentDiv.style.display = 'none';
        return;
    }
    
    // Show content
    contentDiv.style.display = 'block';
    
    // Update metrics
    const totalVotes = risultatiData.find(row => row.Voce === 'Totale')[location];
    const percFuturo = risultatiData.find(row => row.Voce === '% FUTURO')[location];
    const percProgetto = risultatiData.find(row => row.Voce === '% PROGETTO')[location];
    
    document.getElementById('totalVotesLocation').textContent = parseInt(totalVotes).toLocaleString();
    document.getElementById('percentFuturo').textContent = `${parseFloat(percFuturo).toFixed(1)}%`;
    document.getElementById('percentProgetto').textContent = `${parseFloat(percProgetto).toFixed(1)}%`;
    
    // Update charts
    updateLocationResultsChart(location);
    updateTopCandidatesChart(location);
}

function updateLocationResultsChart(location) {
    const ctx = document.getElementById('locationResultsChart_1').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.locationResultsChart instanceof Chart) {
        window.locationResultsChart.destroy();
    }
    
    const results = [
        {
            list: 'FUTURO VALLELAGHI',
            votes: parseInt(risultatiData.find(row => row.Voce === 'FUTURO VALLELAGHI')[location]),
            percent: parseFloat(risultatiData.find(row => row.Voce === '% FUTURO')[location])
        },
        {
            list: 'PROGETTO VALLELAGHI',
            votes: parseInt(risultatiData.find(row => row.Voce === 'PROGETTO VALLELAGHI')[location]),
            percent: parseFloat(risultatiData.find(row => row.Voce === '% PROGETTO')[location])
        }
    ];
    
    console.log(ctx)
    window.locationResultsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: results.map(r => `${r.list}\n${r.votes.toLocaleString()} voti`),
            datasets: [{
                data: results.map(r => r.votes),
                backgroundColor: [
                    'rgba(255, 127, 14, 0.8)',
                    'rgba(31, 119, 180, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 127, 14, 1)',
                    'rgba(31, 119, 180, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = results[context.dataIndex];
                            return `${data.list}: ${data.votes.toLocaleString()} voti (${data.percent.toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });
}


function updateTopCandidatesChart(location) {
    const ctx = document.getElementById('topCandidatesChart').getContext('2d');
    const tableBody = document.querySelector('#topCandidatesDataTable tbody');
    
    // Destroy previous chart if exists
    if (window.topCandidatesChart instanceof Chart) {
        window.topCandidatesChart.destroy();
    }
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Get location column name in preferenzeData (different format)
    const locationMapping = {
        'VEZZANO': 'Vezzano',
        'RANZO': 'Ranzo',
        'PADERGNONE': 'Padergnone',
        'TERLAGO': 'Terlago',
        'COVELO': 'Covelo'
    };
    const prefLocation = locationMapping[location] || location;
    
    // Get top 10 candidates for this location
    const topCandidates = [...preferenzeData]
        .filter(candidate => candidate[prefLocation] && !isNaN(candidate[prefLocation]))
        .sort((a, b) => parseInt(b[prefLocation]) - parseInt(a[prefLocation]))
        .slice(0, 10);
    
    // Calculate total votes in this location for percentage
    const totalLocationVotes = topCandidates.reduce((sum, candidate) => sum + parseInt(candidate[prefLocation]), 0);
    
    // Prepare chart data
    const chartData = topCandidates.map(candidate => ({
        candidate: candidate.Candidato,
        votes: parseInt(candidate[prefLocation]),
        percentage: ((parseInt(candidate[prefLocation]) / totalLocationVotes) * 100).toFixed(1),
        list: candidate.Lista
    }));
    
    // Create chart
    window.topCandidatesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(d => d.candidate),
            datasets: [{
                label: 'Voti',
                data: chartData.map(d => d.votes),
                backgroundColor: chartData.map(d => 
                    d.list === 'FUTURO VALLELAGHI' ? 'rgba(255, 127, 14, 0.8)' : 'rgba(31, 119, 180, 0.8)'
                ),
                borderColor: chartData.map(d => 
                    d.list === 'FUTURO VALLELAGHI' ? 'rgba(255, 127, 14, 1)' : 'rgba(31, 119, 180, 1)'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const data = chartData[context.dataIndex];
                            return [
                                `Voti: ${data.votes.toLocaleString()}`,
                                `% del seggio: ${data.percentage}%`,
                                `Lista: ${data.list}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Populate table
    chartData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.candidate}</td>
            <td><span class="badge" style="background-color: ${
                data.list === 'FUTURO VALLELAGHI' ? 'var(--futuro-color)' : 'var(--progetto-color)'
            }">${data.list}</span></td>
            <td>${data.votes.toLocaleString()}</td>
            <td>${data.percentage}%</td>
        `;
        tableBody.appendChild(row);
    });
}


function initDataTab() {
    const tabContent = document.querySelector('#data');
    
    const html = `
        <h2 class="mb-4">Dati Grezzi</h2>
        
        <div class="card mb-4">
            <div class="card-header">Filtri e Opzioni</div>
            <div class="card-body">
                <ul class="nav nav-tabs mb-3" id="dataTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="preferences-tab" data-bs-toggle="tab" data-bs-target="#preferencesData">
                            <i class="fas fa-user-check me-1"></i> Preferenze
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="results-tab" data-bs-toggle="tab" data-bs-target="#resultsData">
                            <i class="fas fa-list-alt me-1"></i> Risultati Liste
                        </button>
                    </li>
                </ul>
                
                <div class="tab-content" id="dataTabsContent">
                    <div class="tab-pane fade show active" id="preferencesData" role="tabpanel">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="prefListFilter" class="form-label">Filtra per lista</label>
                                <select class="form-select" id="prefListFilter" multiple>
                                    <option value="PROGETTO VALLELAGHI">PROGETTO VALLELAGHI</option>
                                    <option value="FUTURO VALLELAGHI">FUTURO VALLELAGHI</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="prefLocationFilter" class="form-label">Filtra per seggio</label>
                                <select class="form-select" id="prefLocationFilter" multiple>
                                    <option value="Vezzano">Vezzano</option>
                                    <option value="Ranzo">Ranzo</option>
                                    <option value="Padergnone">Padergnone</option>
                                    <option value="Terlago">Terlago</option>
                                    <option value="Covelo">Covelo</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <div class="metric-card">
                                    <div class="metric-value" id="prefTotalCandidates">0</div>
                                    <div class="metric-label">Candidati</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="metric-card">
                                    <div class="metric-value" id="prefTotalVotes">0</div>
                                    <div class="metric-label">Voti totali</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="metric-card">
                                    <div class="metric-value" id="prefAvgPerVote">0.00</div>
                                    <div class="metric-label">Media preferenze/voto</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="preferencesTable">
                                <thead>
                                    <tr>
                                        <th>Candidato</th>
                                        <th>Lista</th>
                                        <th>Vezzano</th>
                                        <th>Ranzo</th>
                                        <th>Padergnone</th>
                                        <th>Terlago</th>
                                        <th>Covelo</th>
                                        <th>Totale</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        
                        <div class="mt-3">
                            <button class="btn btn-primary" id="exportPrefCSV">
                                <i class="fas fa-download me-1"></i> Esporta CSV
                            </button>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="resultsData" role="tabpanel">
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <div class="metric-card">
                                    <div class="metric-value" id="totalValidVotes">${parseInt(risultatiData.find(row => row.Voce === 'Totale')['TOTALE']).toLocaleString()}</div>
                                    <div class="metric-label">Voti validi totali</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="resultsTable">
                                <thead>
                                    <tr>
                                        <th>Voce</th>
                                        <th>VEZZANO</th>
                                        <th>RANZO</th>
                                        <th>PADERGNONE</th>
                                        <th>TERLAGO</th>
                                        <th>COVELO</th>
                                        <th>TOTALE</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        
                        <div class="mt-3">
                            <div class="btn-group">
                                <button class="btn btn-primary" id="exportResultsCSV">
                                    <i class="fas fa-download me-1"></i> Esporta Tutto
                                </button>
                                <button class="btn btn-outline-primary" id="exportPercentagesCSV">
                                    <i class="fas fa-percentage me-1"></i> Solo Percentuali
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">Informazioni Tecniche</div>
            <div class="card-body">
                <div class="accordion" id="dataInfoAccordion">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#prefInfo">
                                Dati Preferenze
                            </button>
                        </h2>
                        <div id="prefInfo" class="accordion-collapse collapse show" data-bs-parent="#dataInfoAccordion">
                            <div class="accordion-body">
                                <p>Mostra i voti di preferenza per ogni candidato, divisi per seggio elettorale.</p>
                                <ul>
                                    <li><strong>Candidato:</strong> Nome completo del candidato</li>
                                    <li><strong>Lista:</strong> Lista di appartenenza</li>
                                    <li><strong>Colonne numeriche:</strong> Voti ricevuti nel seggio specifico</li>
                                    <li><strong>Totale:</strong> Somma di tutti i voti ricevuti</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#resultsInfo">
                                Risultati Liste
                            </button>
                        </h2>
                        <div id="resultsInfo" class="accordion-collapse collapse" data-bs-parent="#dataInfoAccordion">
                            <div class="accordion-body">
                                <p>Mostra i risultati aggregati per lista, con voti assoluti e percentuali.</p>
                                <ul>
                                    <li><strong>Voce:</strong> Identifica la lista o il totale</li>
                                    <li><strong>Colonne numeriche:</strong> Voti assoluti per seggio</li>
                                    <li><strong>%:</strong> Percentuali calcolate sul totale voti validi</li>
                                    <li><strong>TOTALE:</strong> Colonna con il risultato complessivo</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    tabContent.innerHTML = html;
    
    // Initialize the tab functionality
    setupDataTab();
}

function setupDataTab() {
    // Initialize multiple select filters
    const prefListFilter = document.getElementById('prefListFilter');
    const prefLocationFilter = document.getElementById('prefLocationFilter');
    
    // Make them multiple select
    prefListFilter.multiple = true;
    prefLocationFilter.multiple = true;
    
    // Add custom styling
    prefListFilter.classList.add('form-control');
    prefLocationFilter.classList.add('form-control');
    
    // Add event listeners
    prefListFilter.addEventListener('change', updatePreferencesTable);
    prefLocationFilter.addEventListener('change', updatePreferencesTable);
    document.getElementById('exportPrefCSV').addEventListener('click', exportPreferencesCSV);
    document.getElementById('exportResultsCSV').addEventListener('click', exportResultsCSV);
    document.getElementById('exportPercentagesCSV').addEventListener('click', exportPercentagesCSV);
    
    // Initialize tables
    updatePreferencesTable();
    updateResultsTable();
}

function updatePreferencesTable() {
    const tableBody = document.querySelector('#preferencesTable tbody');
    const listFilter = Array.from(document.getElementById('prefListFilter').selectedOptions).map(opt => opt.value);
    const locationFilter = Array.from(document.getElementById('prefLocationFilter').selectedOptions).map(opt => opt.value);
    
    // Filter data
    let filteredData = [...preferenzeData];
    
    if (listFilter.length > 0) {
        filteredData = filteredData.filter(row => listFilter.includes(row.Lista));
    }
    
    // Always show these columns regardless of location filter
    const alwaysShowCols = ['Candidato', 'Lista', 'Totale'];
    
    // Get location columns to show
    let locationCols = ['Vezzano', 'Ranzo', 'Padergnone', 'Terlago', 'Covelo'];
    if (locationFilter.length > 0) {
        locationCols = locationFilter;
    }
    
    // Clear and rebuild table
    tableBody.innerHTML = '';
    
    // Update metrics
    document.getElementById('prefTotalCandidates').textContent = filteredData.length;
    
    const totalVotes = filteredData.reduce((sum, row) => sum + parseInt(row.Totale), 0);
    document.getElementById('prefTotalVotes').textContent = totalVotes.toLocaleString();
    
    const totalBallots = parseInt(risultatiData.find(row => row.Voce === 'Totale')['TOTALE']);
    const avgPerVote = (totalVotes / totalBallots).toFixed(2);
    document.getElementById('prefAvgPerVote').textContent = avgPerVote;
    
    // Populate table
    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Always show these columns
        alwaysShowCols.forEach(col => {
            const td = document.createElement('td');
            if (col === 'Totale') {
                td.textContent = parseInt(row[col]).toLocaleString();
                td.style.fontWeight = 'bold';
            } else {
                td.textContent = row[col];
                
                if (col === 'Lista') {
                    td.innerHTML = `<span class="badge" style="background-color: ${
                        row[col] === 'FUTURO VALLELAGHI' ? 'var(--futuro-color)' : 'var(--progetto-color)'
                    }">${row[col]}</span>`;
                }
            }
            tr.appendChild(td);
        });
        
        // Add location columns
        locationCols.forEach(loc => {
            const td = document.createElement('td');
            const votes = parseInt(row[loc]) || 0;
            td.textContent = votes.toLocaleString();
            
            // Highlight if this is a location filter match
            if (locationFilter.length > 0 && locationFilter.includes(loc)) {
                td.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
            }
            
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
    
    // Show/hide location columns in header
    const headerCells = document.querySelectorAll('#preferencesTable thead th');
    for (let i = 2; i < headerCells.length; i++) { // Skip first two columns
        const colName = headerCells[i].textContent;
        if (locationCols.includes(colName) || alwaysShowCols.includes(colName)) {
            headerCells[i].style.display = '';
        } else {
            headerCells[i].style.display = 'none';
        }
    }
}

function updateResultsTable() {
    const tableBody = document.querySelector('#resultsTable tbody');
    
    // Clear and rebuild table
    tableBody.innerHTML = '';
    
    risultatiData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Add Voce column
        const tdVoce = document.createElement('td');
        tdVoce.textContent = row.Voce;
        
        if (row.Voce.startsWith('%')) {
            tdVoce.style.fontWeight = 'bold';
            tdVoce.style.color = '#0d6efd';
        } else if (row.Voce === 'Totale') {
            tdVoce.style.fontWeight = 'bold';
        }
        
        tr.appendChild(tdVoce);
        
        // Add location columns
        ['VEZZANO', 'RANZO', 'PADERGNONE', 'TERLAGO', 'COVELO', 'TOTALE'].forEach(loc => {
            const td = document.createElement('td');
            const value = row[loc];
            
            if (row.Voce.startsWith('%')) {
                td.textContent = `${parseFloat(value).toFixed(1)}%`;
                td.style.fontWeight = 'bold';
                td.style.color = '#0d6efd';
            } else {
                td.textContent = parseInt(value).toLocaleString();
                
                if (loc === 'TOTALE') {
                    td.style.fontWeight = 'bold';
                }
            }
            
            tr.appendChild(td);
        });
        
        tableBody.appendChild(tr);
    });
}

function exportPreferencesCSV() {
    const listFilter = Array.from(document.getElementById('prefListFilter').selectedOptions).map(opt => opt.value);
    const locationFilter = Array.from(document.getElementById('prefLocationFilter').selectedOptions).map(opt => opt.value);
    
    // Filter data
    let filteredData = [...preferenzeData];
    
    if (listFilter.length > 0) {
        filteredData = filteredData.filter(row => listFilter.includes(row.Lista));
    }
    
    // Get columns to include
    const cols = ['Candidato', 'Lista'];
    const locationCols = ['Vezzano', 'Ranzo', 'Padergnone', 'Terlago', 'Covelo'];
    
    if (locationFilter.length > 0) {
        cols.push(...locationFilter);
    } else {
        cols.push(...locationCols);
    }
    
    cols.push('Totale');
    
    // Prepare CSV content
    let csvContent = cols.join(';') + '\n';
    
    filteredData.forEach(row => {
        const rowData = cols.map(col => {
            if (col === 'Totale') {
                return parseInt(row[col]);
            }
            return row[col] || 0;
        });
        csvContent += rowData.join(';') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'preferenze_vallelaghi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportResultsCSV() {
    // Prepare CSV content
    let csvContent = 'Voce;VEZZANO;RANZO;PADERGNONE;TERLAGO;COVELO;TOTALE\n';
    
    risultatiData.forEach(row => {
        const rowData = [
            row.Voce,
            row.VEZZANO,
            row.RANZO,
            row.PADERGNONE,
            row.TERLAGO,
            row.COVELO,
            row.TOTALE
        ];
        csvContent += rowData.join(';') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'risultati_liste_vallelaghi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportPercentagesCSV() {
    // Filter only percentage rows
    const percentageData = risultatiData.filter(row => row.Voce.startsWith('%'));
    
    // Prepare CSV content
    let csvContent = 'Voce;VEZZANO;RANZO;PADERGNONE;TERLAGO;COVELO;TOTALE\n';
    
    percentageData.forEach(row => {
        const rowData = [
            row.Voce,
            parseFloat(row.VEZZANO).toFixed(1),
            parseFloat(row.RANZO).toFixed(1),
            parseFloat(row.PADERGNONE).toFixed(1),
            parseFloat(row.TERLAGO).toFixed(1),
            parseFloat(row.COVELO).toFixed(1),
            parseFloat(row.TOTALE).toFixed(1)
        ];
        csvContent += rowData.join(';') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'percentuali_vallelaghi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}