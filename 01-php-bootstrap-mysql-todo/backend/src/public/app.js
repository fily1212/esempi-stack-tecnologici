/**
 * App.js - Logica frontend per Todo List App
 * Gestisce tutte le interazioni con le API e l'UI
 */

// Configurazione
const API_BASE = '/api';
let allTasks = [];
let currentFilter = { stato: '', categoria: '' };
let editModal = null;

// Verifica autenticazione all'avvio
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = '/public/login.html';
        return;
    }

    // Mostra nome utente
    document.getElementById('userName').textContent = user.nome || user.email;

    // Inizializza modal Bootstrap
    editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // Event listeners
    setupEventListeners();

    // Carica i task
    loadTasks();
});

/**
 * Configura tutti gli event listeners
 */
function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Form nuovo task
    document.getElementById('taskForm').addEventListener('submit', createTask);

    // Form modifica task
    document.getElementById('saveEditBtn').addEventListener('click', updateTask);

    // Filtri
    document.querySelectorAll('input[name="filterStato"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFilter.stato = e.target.value;
            filterTasks();
        });
    });

    document.getElementById('filterCategoria').addEventListener('change', (e) => {
        currentFilter.categoria = e.target.value;
        filterTasks();
    });
}

/**
 * Effettua logout
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/public/login.html';
}

/**
 * Carica tutti i task dell'utente
 */
async function loadTasks() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/tasks.php`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Token scaduto o invalido
            logout();
            return;
        }

        const data = await response.json();

        if (response.ok) {
            allTasks = data.tasks || [];
            filterTasks();
            updateStats();
        } else {
            showError('Errore nel caricamento dei task');
        }

    } catch (error) {
        console.error('Errore:', error);
        showError('Errore di connessione');
    } finally {
        document.getElementById('loadingSpinner').classList.add('d-none');
    }
}

/**
 * Filtra i task in base ai filtri attivi
 */
function filterTasks() {
    let filtered = [...allTasks];

    // Filtro per stato
    if (currentFilter.stato) {
        filtered = filtered.filter(task => task.stato === currentFilter.stato);
    }

    // Filtro per categoria
    if (currentFilter.categoria) {
        filtered = filtered.filter(task => task.categoria === currentFilter.categoria);
    }

    renderTasks(filtered);
}

/**
 * Renderizza la lista di task
 */
function renderTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    const noTasks = document.getElementById('noTasks');

    if (tasks.length === 0) {
        tasksList.classList.add('d-none');
        noTasks.classList.remove('d-none');
        return;
    }

    noTasks.classList.add('d-none');
    tasksList.classList.remove('d-none');

    tasksList.innerHTML = tasks.map(task => `
        <div class="card mb-3 ${task.stato === 'completato' ? 'border-success' : 'border-warning'}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title ${task.stato === 'completato' ? 'text-decoration-line-through text-muted' : ''}">
                            ${escapeHtml(task.titolo)}
                        </h6>
                        ${task.descrizione ? `<p class="card-text text-muted small">${escapeHtml(task.descrizione)}</p>` : ''}
                        <div class="mt-2">
                            <span class="badge bg-${getCategoryColor(task.categoria)}">${task.categoria}</span>
                            <span class="badge bg-${task.stato === 'completato' ? 'success' : 'warning'}">
                                ${task.stato === 'completato' ? 'Completato' : 'Da fare'}
                            </span>
                            <small class="text-muted ms-2">
                                <i class="bi bi-calendar"></i>
                                ${formatDate(task.created_at)}
                            </small>
                        </div>
                    </div>
                    <div class="btn-group btn-group-sm ms-2">
                        <button class="btn btn-outline-primary" onclick="toggleTaskStatus(${task.id}, '${task.stato}')" title="Cambia stato">
                            <i class="bi bi-${task.stato === 'completato' ? 'arrow-counterclockwise' : 'check2'}"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="openEditModal(${task.id})" title="Modifica">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteTask(${task.id})" title="Elimina">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Crea un nuovo task
 */
async function createTask(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const titolo = document.getElementById('titolo').value;
    const descrizione = document.getElementById('descrizione').value;
    const categoria = document.getElementById('categoria').value;

    try {
        const response = await fetch(`${API_BASE}/tasks.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ titolo, descrizione, categoria })
        });

        const data = await response.json();

        if (response.ok) {
            // Reset form
            document.getElementById('taskForm').reset();

            // Ricarica i task
            await loadTasks();

            showSuccess('Task creato con successo!');
        } else {
            showError(data.error || 'Errore nella creazione del task');
        }

    } catch (error) {
        console.error('Errore:', error);
        showError('Errore di connessione');
    }
}

/**
 * Cambia lo stato di un task (da fare <-> completato)
 */
async function toggleTaskStatus(taskId, currentStato) {
    const token = localStorage.getItem('token');
    const newStato = currentStato === 'completato' ? 'da_fare' : 'completato';

    try {
        const response = await fetch(`${API_BASE}/tasks.php?id=${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stato: newStato })
        });

        if (response.ok) {
            await loadTasks();
        } else {
            showError('Errore nell\'aggiornamento del task');
        }

    } catch (error) {
        console.error('Errore:', error);
        showError('Errore di connessione');
    }
}

/**
 * Apre il modal di modifica task
 */
function openEditModal(taskId) {
    const task = allTasks.find(t => t.id == taskId);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTitolo').value = task.titolo;
    document.getElementById('editDescrizione').value = task.descrizione || '';
    document.getElementById('editCategoria').value = task.categoria;
    document.getElementById('editStato').value = task.stato;

    editModal.show();
}

/**
 * Aggiorna un task esistente
 */
async function updateTask() {
    const token = localStorage.getItem('token');
    const taskId = document.getElementById('editTaskId').value;
    const titolo = document.getElementById('editTitolo').value;
    const descrizione = document.getElementById('editDescrizione').value;
    const categoria = document.getElementById('editCategoria').value;
    const stato = document.getElementById('editStato').value;

    try {
        const response = await fetch(`${API_BASE}/tasks.php?id=${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ titolo, descrizione, categoria, stato })
        });

        if (response.ok) {
            editModal.hide();
            await loadTasks();
            showSuccess('Task aggiornato con successo!');
        } else {
            showError('Errore nell\'aggiornamento del task');
        }

    } catch (error) {
        console.error('Errore:', error);
        showError('Errore di connessione');
    }
}

/**
 * Elimina un task
 */
async function deleteTask(taskId) {
    if (!confirm('Sei sicuro di voler eliminare questo task?')) {
        return;
    }

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE}/tasks.php?id=${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadTasks();
            showSuccess('Task eliminato con successo!');
        } else {
            showError('Errore nell\'eliminazione del task');
        }

    } catch (error) {
        console.error('Errore:', error);
        showError('Errore di connessione');
    }
}

/**
 * Aggiorna le statistiche
 */
function updateStats() {
    const total = allTasks.length;
    const todo = allTasks.filter(t => t.stato === 'da_fare').length;
    const done = allTasks.filter(t => t.stato === 'completato').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statTodo').textContent = todo;
    document.getElementById('statDone').textContent = done;
}

/**
 * Utility: ottiene il colore della categoria
 */
function getCategoryColor(categoria) {
    const colors = {
        'Lavoro': 'primary',
        'Personale': 'info',
        'Studio': 'warning',
        'Altro': 'secondary'
    };
    return colors[categoria] || 'secondary';
}

/**
 * Utility: formatta una data
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Utility: escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Mostra un messaggio di errore (toast)
 */
function showError(message) {
    // Implementazione semplice con alert (può essere migliorata con toast Bootstrap)
    alert('❌ ' + message);
}

/**
 * Mostra un messaggio di successo (toast)
 */
function showSuccess(message) {
    // Implementazione semplice con alert (può essere migliorata con toast Bootstrap)
    console.log('✅ ' + message);
}
