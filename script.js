// Every Little Thing - Main JavaScript

// Data structure to store lists
let lists = [];
let currentListId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadLists();
    initializeEventListeners();
    renderLists();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Create new list button
    document.getElementById('createListBtn').addEventListener('click', () => {
        openModal('newListModal');
        document.getElementById('listTitleInput').value = '';
        document.getElementById('listTitleInput').focus();
    });

    // Save new list
    document.getElementById('saveListBtn').addEventListener('click', () => {
        const title = document.getElementById('listTitleInput').value.trim();
        if (title) {
            createNewList(title);
            closeModal('newListModal');
        }
    });

    // Save new item
    document.getElementById('saveItemBtn').addEventListener('click', () => {
        const itemText = document.getElementById('itemInput').value.trim();
        if (itemText && currentListId !== null) {
            addItemToList(currentListId, itemText);
            closeModal('addItemModal');
        }
    });

    // Update list title
    document.getElementById('updateListTitleBtn').addEventListener('click', () => {
        const newTitle = document.getElementById('editListTitleInput').value.trim();
        if (newTitle && currentListId !== null) {
            updateListTitle(currentListId, newTitle);
            closeModal('editListModal');
        }
    });

    // Enter key support for modals
    document.getElementById('listTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveListBtn').click();
        }
    });

    document.getElementById('itemInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('saveItemBtn').click();
        }
    });

    document.getElementById('editListTitleInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('updateListTitleBtn').click();
        }
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Create a new list
function createNewList(title) {
    const newList = {
        id: Date.now(),
        title: title,
        items: [],
        createdAt: new Date().toISOString()
    };
    lists.push(newList);
    saveLists();
    renderLists();
}

// Add item to a specific list
function addItemToList(listId, itemText) {
    const list = lists.find(l => l.id === listId);
    if (list) {
        list.items.push({
            id: Date.now(),
            text: itemText,
            createdAt: new Date().toISOString()
        });
        saveLists();
        renderLists();
    }
}

// Update list title
function updateListTitle(listId, newTitle) {
    const list = lists.find(l => l.id === listId);
    if (list) {
        list.title = newTitle;
        saveLists();
        renderLists();
    }
}

// Delete a list
function deleteList(listId) {
    if (confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
        lists = lists.filter(l => l.id !== listId);
        saveLists();
        renderLists();
    }
}

// Delete an item from a list
function deleteItem(listId, itemId) {
    const list = lists.find(l => l.id === listId);
    if (list) {
        list.items = list.items.filter(item => item.id !== itemId);
        saveLists();
        renderLists();
    }
}

// Show add item modal
function showAddItemModal(listId) {
    currentListId = listId;
    document.getElementById('itemInput').value = '';
    openModal('addItemModal');
    document.getElementById('itemInput').focus();
}

// Show edit list title modal
function showEditListModal(listId) {
    currentListId = listId;
    const list = lists.find(l => l.id === listId);
    if (list) {
        document.getElementById('editListTitleInput').value = list.title;
        openModal('editListModal');
        document.getElementById('editListTitleInput').focus();
    }
}

// Open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Render all lists
function renderLists() {
    const container = document.getElementById('listsContainer');
    
    if (lists.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.3;"></div>
                    <h3>no lists yet</h3>
                    <p>click create new list</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = lists.map(list => `
        <div class="col-md-6 col-lg-4">
            <div class="list-card">
                <div class="list-header">
                    <h3 class="list-title">${escapeHtml(list.title)}</h3>
                    <div class="list-actions">
                        <button class="btn-icon" onclick="showEditListModal(${list.id})" title="Edit list title">
                            ✎
                        </button>
                        <button class="btn-icon delete-list-btn" onclick="deleteList(${list.id})" title="Delete list">
                            ⊘
                        </button>
                    </div>
                </div>
                <ul class="list-items">
                    ${list.items.length === 0 ? 
                        '<li class="text-muted text-center py-3">no items yet</li>' : 
                        list.items.map(item => `
                            <li class="list-item">
                                <span class="item-text">
                                    <span class="item-icon"> ★</span>
                                    ${escapeHtml(item.text)}
                                </span>
                                <button class="delete-item-btn" onclick="deleteItem(${list.id}, ${item.id})" title="Delete item">
                                    ✕
                                </button>
                            </li>
                        `).join('')
                    }
                </ul>
                <button class="btn add-item-btn" onclick="showAddItemModal(${list.id})">
                    + add item
                </button>
            </div>
        </div>
    `).join('');
}

// Save lists to localStorage
function saveLists() {
    localStorage.setItem('everyLittleThing', JSON.stringify(lists));
}

// Load lists from localStorage
function loadLists() {
    const stored = localStorage.getItem('everyLittleThing');
    if (stored) {
        try {
            lists = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading lists:', e);
            lists = [];
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
