let inventory = JSON.parse(localStorage.getItem('moms_inv')) || [];
let sales = JSON.parse(localStorage.getItem('moms_sales')) || [];
let orders = JSON.parse(localStorage.getItem('moms_orders')) || [];

// --- INVENTORY ---
function addItem() {
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    if (name && price) {
        inventory.push({ id: Date.now(), name, price });
        saveData();
        renderInventory();
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
    }
}

function deleteItem(index) {
    inventory.splice(index, 1);
    saveData();
    renderInventory();
}

function renderInventory() {
    const body = document.getElementById('inventoryBody');
    const select = document.getElementById('orderItemSelect');
    
    if (body) {
        body.innerHTML = inventory.map((item, i) => `
            <tr>
                <td>${item.name}</td>
                <td>$${item.price}</td>
                <td><button class="delete-btn" onclick="deleteItem(${i})">Delete</button></td>
            </tr>`).join('');
    }

    if (select) {
        select.innerHTML = '<option value="">-- Select Item --</option>' + 
            inventory.map(item => `<option value="${item.id}">${item.name} ($${item.price})</option>`).join('');
    }
}

// --- ORDERS ---
function addOrder() {
    const itemId = document.getElementById('orderItemSelect').value;
    const qty = parseInt(document.getElementById('orderQty').value);
    const item = inventory.find(i => i.id == itemId);
    if (item && qty) {
        orders.push({ id: Date.now(), name: item.name, price: item.price, qty, done: false });
        saveData();
        renderOrders();
    }
}

function toggleOrder(id) {
    const order = orders.find(o => o.id == id);
    if (order && !order.done) {
        order.done = true;
        sales.push({ total: order.price * order.qty, date: new Date().toISOString() });
        saveData();
        renderOrders();
    }
}

function renderOrders() {
    const todo = document.getElementById('todoList');
    const done = document.getElementById('doneList');
    if (!todo) return;
    todo.innerHTML = ''; done.innerHTML = '';
    orders.forEach(o => {
        const html = `<div><input type="checkbox" ${o.done ? 'checked disabled' : ''} onchange="toggleOrder(${o.id})"> ${o.qty}x ${o.name}</div>`;
        o.done ? done.innerHTML += html : todo.innerHTML += html;
    });
}

function clearDone() {
    orders = orders.filter(o => !o.done);
    saveData();
    renderOrders();
}

// --- SALES ---
function renderSales() {
    const display = document.getElementById('salesTotalDisplay');
    const filter = document.getElementById('salesFilter')?.value;
    if (!display) return;
    const now = new Date();
    const filtered = sales.filter(s => {
        const sDate = new Date(s.date);
        const diff = (now - sDate) / (1000 * 60 * 60 * 24);
        if (filter === 'today') return sDate.toDateString() === now.toDateString();
        if (filter === '3days') return diff <= 3;
        if (filter === 'week') return diff <= 7;
        if (filter === 'month') return diff <= 30;
        return true;
    });
    const total = filtered.reduce((sum, s) => sum + s.total, 0);
    display.innerText = `$${total.toFixed(2)}`;
}

function saveData() {
    localStorage.setItem('moms_inv', JSON.stringify(inventory));
    localStorage.setItem('moms_sales', JSON.stringify(sales));
    localStorage.setItem('moms_orders', JSON.stringify(orders));
}

window.onload = () => { renderInventory(); renderOrders(); renderSales(); };
