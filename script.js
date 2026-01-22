// Load data from storage when the page opens
let inventory = JSON.parse(localStorage.getItem('myInventory')) || [];
renderTable();

function addItem() {
    const name = document.getElementById('itemName').value;
    const qty = document.getElementById('itemQty').value;

    if (name && qty) {
        inventory.push({ name, qty });
        updateStorage();
        renderTable();
        // Clear inputs
        document.getElementById('itemName').value = '';
        document.getElementById('itemQty').value = '';
    }
}

function deleteItem(index) {
    inventory.splice(index, 1);
    updateStorage();
    renderTable();
}

function updateStorage() {
    localStorage.setItem('myInventory', JSON.stringify(inventory));
}

function renderTable() {
    const body = document.getElementById('inventoryBody');
    body.innerHTML = inventory.map((item, index) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td><button class="delete-btn" onclick="deleteItem(${index})">Remove</button></td>
        </tr>
    `).join('');
}
