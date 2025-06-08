// Global variables
let cards = [];
let filteredCards = [];
let isLoading = false;

// API URL for Dark Magician archetype
const API_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=Dark%20Magician';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    fetchCards();
});

// Fetch cards from the API
async function fetchCards() {
    const loadingEl = document.getElementById('loading');
    const cardsGridEl = document.getElementById('cards-grid');
    const errorEl = document.getElementById('error');
    const noResultsEl = document.getElementById('no-results');

    // Show loading state
    isLoading = true;
    loadingEl.classList.remove('hidden');
    cardsGridEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    noResultsEl.classList.add('hidden');

    try {
        console.log('Fetching Dark Magician cards...');
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        cards = data.data || [];
        filteredCards = [...cards];
        
        console.log(`Fetched ${cards.length} cards`);
        
        // Populate filter options
        populateFilterOptions();
        
        // Render cards
        renderCards();
        
    } catch (error) {
        console.error('Error fetching cards:', error);
        showError();
    } finally {
        isLoading = false;
        loadingEl.classList.add('hidden');
    }
}

// Populate filter dropdown options
function populateFilterOptions() {
    // Get unique values for each filter
    const types = [...new Set(cards.map(card => card.type))].sort();
    const levels = [...new Set(cards.map(card => card.level).filter(level => level !== undefined))].sort((a, b) => a - b);
    const races = [...new Set(cards.map(card => card.race).filter(race => race))].sort();

    // Populate type filter
    const typeFilter = document.getElementById('type-filter');
    typeFilter.innerHTML = '<option value="">All Types</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });

    // Populate level filter
    const levelFilter = document.getElementById('level-filter');
    levelFilter.innerHTML = '<option value="">All Levels</option>';
    levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = `Level ${level}`;
        levelFilter.appendChild(option);
    });

    // Populate race filter
    const raceFilter = document.getElementById('race-filter');
    raceFilter.innerHTML = '<option value="">All Races</option>';
    races.forEach(race => {
        const option = document.createElement('option');
        option.value = race;
        option.textContent = race;
        raceFilter.appendChild(option);
    });
}

// Apply filters to cards
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const typeFilter = document.getElementById('type-filter').value;
    const levelFilter = document.getElementById('level-filter').value;
    const atkFilter = document.getElementById('atk-filter').value;
    const raceFilter = document.getElementById('race-filter').value;

    filteredCards = cards.filter(card => {
        // Search by name
        const matchesSearch = card.name.toLowerCase().includes(searchTerm);
        
        // Filter by type
        const matchesType = !typeFilter || card.type === typeFilter;
        
        // Filter by level
        const matchesLevel = !levelFilter || card.level == levelFilter;
        
        // Filter by ATK range
        let matchesATK = true;
        if (atkFilter && card.atk !== undefined) {
            const atk = card.atk;
            switch (atkFilter) {
                case '0-999':
                    matchesATK = atk >= 0 && atk <= 999;
                    break;
                case '1000-1999':
                    matchesATK = atk >= 1000 && atk <= 1999;
                    break;
                case '2000-2999':
                    matchesATK = atk >= 2000 && atk <= 2999;
                    break;
                case '3000+':
                    matchesATK = atk >= 3000;
                    break;
            }
        } else if (atkFilter && card.atk === undefined) {
            matchesATK = false;
        }
        
        // Filter by race
        const matchesRace = !raceFilter || card.race === raceFilter;
        
        return matchesSearch && matchesType && matchesLevel && matchesATK && matchesRace;
    });

    renderCards();
    updateResultsCounter();
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('level-filter').value = '';
    document.getElementById('atk-filter').value = '';
    document.getElementById('race-filter').value = '';
    
    filteredCards = [...cards];
    renderCards();
    updateResultsCounter();
}

// Update results counter
function updateResultsCounter() {
    const counter = document.getElementById('results-counter');
    const total = cards.length;
    const filtered = filteredCards.length;
    
    if (filtered === total) {
        counter.textContent = `Showing all ${total} cards`;
    } else {
        counter.textContent = `Showing ${filtered} of ${total} cards`;
    }
}

// Render cards in the grid
function renderCards() {
    const cardsGridEl = document.getElementById('cards-grid');
    const noResultsEl = document.getElementById('no-results');
    
    if (filteredCards.length === 0) {
        cardsGridEl.classList.add('hidden');
        noResultsEl.classList.remove('hidden');
        return;
    }

    noResultsEl.classList.add('hidden');
    cardsGridEl.classList.remove('hidden');

    cardsGridEl.innerHTML = filteredCards.map((card, index) => `
        <article class="card-hover bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 animate-fade-in" 
                 style="animation-delay: ${index * 0.05}s"
                 role="article"
                 aria-label="Yu-Gi-Oh card: ${card.name}">
            <div class="relative group">
                <img src="${card.card_images[0].image_url}" 
                     alt="${card.name}"
                     class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <div class="p-6">
                <h3 class="text-lg font-semibold text-white mb-2 line-clamp-2" title="${card.name}">
                    ${card.name}
                </h3>
                
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-400">Type:</span>
                        <span class="text-sm text-yellow-400 font-medium">${card.type}</span>
                    </div>
                    
                    ${card.level ? `
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-400">Level:</span>
                            <span class="text-sm text-white font-medium">${card.level}</span>
                        </div>
                    ` : ''}
                    
                    ${card.atk !== undefined ? `
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-400">ATK/DEF:</span>
                            <span class="text-sm text-white font-medium">${card.atk}/${card.def}</span>
                        </div>
                    ` : ''}
                    
                    ${card.race ? `
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-400">Race:</span>
                            <span class="text-sm text-gray-300 font-medium">${card.race}</span>
                        </div>
                    ` : ''}
                </div>
                
                <button class="mt-4 w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800"
                        onclick="showCardDetails('${card.id}')"
                        aria-label="View details for ${card.name}">
                    View Details
                </button>
            </div>
        </article>
    `).join('');
    
    updateResultsCounter();
}

// Show error state
function showError() {
    const errorEl = document.getElementById('error');
    errorEl.classList.remove('hidden');
}

// Show card details in modal
function showCardDetails(cardId) {
    const card = cards.find(c => c.id == cardId);
    if (!card) return;

    const modalContainer = document.getElementById('modal-container');
    
    // Create modal HTML
    const modalHTML = `
        <div class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 modal-fade-in" onclick="closeModal(event)">
            <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 modal-slide-up" onclick="event.stopPropagation()">
                <div class="relative">
                    <button onclick="closeModal()" 
                            class="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            aria-label="Close modal">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    
                    <div class="p-6">
                        <div class="flex flex-col md:flex-row gap-6">
                            <div class="md:w-1/3">
                                <img src="${card.card_images[0].image_url}" 
                                     alt="${card.name}"
                                     class="w-full rounded-lg shadow-lg">
                            </div>
                            
                            <div class="md:w-2/3">
                                <h2 class="text-2xl font-bold text-white mb-4">${card.name}</h2>
                                
                                <div class="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <span class="text-gray-400 text-sm">Type:</span>
                                        <p class="text-yellow-400 font-medium">${card.type}</p>
                                    </div>
                                    
                                    ${card.level ? `
                                        <div>
                                            <span class="text-gray-400 text-sm">Level:</span>
                                            <p class="text-white font-medium">${card.level}</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${card.atk !== undefined ? `
                                        <div>
                                            <span class="text-gray-400 text-sm">ATK:</span>
                                            <p class="text-white font-medium">${card.atk}</p>
                                        </div>
                                        <div>
                                            <span class="text-gray-400 text-sm">DEF:</span>
                                            <p class="text-white font-medium">${card.def}</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${card.race ? `
                                        <div>
                                            <span class="text-gray-400 text-sm">Race:</span>
                                            <p class="text-gray-300 font-medium">${card.race}</p>
                                        </div>
                                    ` : ''}
                                    
                                    ${card.attribute ? `
                                        <div>
                                            <span class="text-gray-400 text-sm">Attribute:</span>
                                            <p class="text-gray-300 font-medium">${card.attribute}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                ${card.desc ? `
                                    <div>
                                        <h3 class="text-lg font-semibold text-white mb-2">Description</h3>
                                        <p class="text-gray-300 leading-relaxed">${card.desc}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modalContainer.innerHTML = modalHTML;
    
    // Focus management for accessibility
    const closeButton = modalContainer.querySelector('button');
    closeButton.focus();
    
    // Handle escape key
    document.addEventListener('keydown', handleEscapeKey);
}

// Close modal function
function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle escape key press
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
}