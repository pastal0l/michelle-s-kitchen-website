// --- INITIAL DATA LOAD ---
let inventory = JSON.parse(localStorage.getItem('biz_inventory')) || [];
let sales = JSON.parse(localStorage.getItem('biz_sales')) || [];
let orders = JSON.parse(localStorage.getItem('biz_orders')) || [];

// --- TAB SWITCHING ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    if (tabId === 'inventory') renderInventory();
    if (tabId === 'orders') renderOrders();
    if (tabId === 'sales') renderSales();
}

// --- TAB 2: INVENTORY LOGIC ---
function addItem() {
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const qty = parseInt(document.getElementById('itemQty').value);
    if (name && price) {
        inventory.push({ id: Date.now(), name, price, qty });
        saveAndRefresh();
    }
}

function renderInventory() {
    const body = document.getElementById('inventoryBody');
    const select = document.getElementById('orderItemSelect');
    body.innerHTML = '';
    select.innerHTML = '<option value="">Select Item...</option>';

    inventory.forEach((item, index) => {
        body.innerHTML += `
            <tr>
                <td contenteditable="true" onblur="updateItem(${index}, 'name', this.innerText)">${item.name}</td>
                <td contenteditable="true" onblur="updateItem(${index}, 'price', this.innerText)">${item.price}</td>
                <td>${item.qty}</td>
                <td><button onclick="deleteItem(${index})">X</button></td>
            </tr>`;
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

function updateItem(index, key, value) {
    inventory[index][key] = key === 'price' ? parseFloat(value) : value;
    saveAndRefresh();
}

// --- TAB 3: ORDERS & CHECKLIST ---
function addOrder() {
    const itemId = document.getElementById('orderItemSelect').value;
    const qty = parseInt(document.getElementById('orderQty').value);
    const item = inventory.find(i => i.id == itemId);
    if (item && qty) {
        orders.push({ id: Date.now(), name: item.name, qty, price: item.price, done: false });
        saveAndRefresh();
    }
}

function toggleOrder(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order.done) {
        order.done = true;
        // Move to Sales
        sales.push({ ...order, date: new Date().toISOString() });
    } else {
        order.done = false;
        // Logic to remove from sales if unchecked could go here
    }
    saveAndRefresh();
}

function renderOrders() {
    const todo = document.getElementById('todoList');
    const done = document.getElementById('doneList');
    todo.innerHTML = ''; done.innerHTML = '';

    orders.forEach(o => {
        const li = `<li><input type="checkbox" ${o.done ? 'checked disabled' : ''} onchange="toggleOrder(${o.id})"> ${o.qty}x ${o.name}</li>`;
        o.done ? done.innerHTML += li : todo.innerHTML += li;
    });
}

// --- TAB 1: SALES FILTERING ---
function renderSales() {
    const filter = document.getElementById('salesFilter').value;
    const now = new Date();
    let total = 0;

    const filtered = sales.filter(s => {
        const sDate = new Date(s.date);
        const diffDays = (now - sDate) / (1000 * 60 * 60 * 24);
        if (filter === 'today') return diffDays < 1;
        if (filter === '3days') return diffDays < 3;
        if (filter === 'week') return diffDays < 7;
        if (filter === 'month') return diffDays < 30;
        return true;
    });

    filtered.forEach(s => total += (s.price * s.qty));
    document.getElementById('salesTotalDisplay').innerText = `Total Revenue: $${total.toFixed(2)}`;
}

// --- UTILS ---
function saveAndRefresh() {
    localStorage.setItem('biz_inventory', JSON.stringify(inventory));
    localStorage.setItem('biz_sales', JSON.stringify(sales));
    localStorage.setItem('biz_orders', JSON.stringify(orders));
    renderInventory();
    renderOrders();
    renderSales();
}

// Default view
showTab('inventory');
