// --- 1. DATA INITIALIZATION ---
// This pulls the data from the browser's memory or starts fresh if empty
let inventory = JSON.parse(localStorage.getItem('biz_inventory')) || [];
let sales = JSON.parse(localStorage.getItem('biz_sales')) || [];
let orders = JSON.parse(localStorage.getItem('biz_orders')) || [];

// --- 2. INVENTORY LOGIC (TAB 2) ---
function addItem() {
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (name && !isNaN(price)) {
        inventory.push({ id: Date.now(), name, price });
        saveData();
        renderInventory();
        // Clear inputs
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
    } else {
        alert("Please enter a valid name and price.");
    }
}

function renderInventory() {
    const body = document.getElementById('inventoryBody');
    const select = document.getElementById('orderItemSelect');
    if (!body) return; // Exit if not on the inventory page

    body.innerHTML = '';
    inventory.forEach((item, index) => {
        body.innerHTML += `
            <tr>
                <td contenteditable="true" onblur="updateItem(${index}, 'name', this.innerText)">${item.name}</td>
                <td contenteditable="true" onblur="updateItem(${index}, 'price', this.innerText)">${item.price}</td>
                <td><button class="delete-btn" onclick="deleteItem(${index})">Delete</button></td>
            </tr>`;
    });

    // If we are on the Orders page, fill the dropdown menu
    if (select) {
        select.innerHTML = '<option value="">-- Choose Item --</option>';
        inventory.forEach(item => {
            select.innerHTML += `<option value="${item.id}">${item.name} ($${item.price})</option>`;
        });
    }
}

function updateItem(index, key, value) {
    if (key === 'price') {
        inventory[index][key] = parseFloat(value) || 0;
    } else {
        inventory[index][key] = value;
    }
    saveData();
}

function deleteItem(index) {
    if(confirm("Delete this item?")) {
        inventory.splice(index, 1);
        saveData();
        renderInventory();
    }
}

// --- 3. ORDERS LOGIC (TAB 3) ---
function addOrder() {
    const itemId = document.getElementById('orderItemSelect').value;
    const qty = parseInt(document.getElementById('orderQty').value);
    const item = inventory.find(i => i.id == itemId);

    if (item && qty > 0) {
        orders.push({ 
            id: Date.now(), 
            name: item.name, 
            qty: qty, 
            price: item.price, 
            done: false 
        });
        saveData();
        renderOrders();
    }
}

function toggleOrder(orderId) {
    const orderIndex = orders.findIndex(o => o.id == orderId);
    const order = orders[orderIndex];

    if (!order.done) {
        order.done = true;
        // Logic: When checked, add to Sales with current date/time
        sales.push({
            name: order.name,
            qty: order.qty,
            totalPrice: (order.price * order.qty),
            date: new Date().toISOString()
        });
    }
    saveData();
    renderOrders();
}

function renderOrders() {
    const todo = document.getElementById('todoList');
    const done = document.getElementById('doneList');
    if (!todo) return; // Exit if not on orders page

    todo.innerHTML = '';
    done.innerHTML = '';

    orders.forEach(o => {
        const itemHtml = `
            <div>
                <input type="checkbox" ${o.done ? 'checked disabled' : ''} onchange="toggleOrder(${o.id})">
                <span>${o.qty}x ${o.name}</span>
            </div>`;
        
        if (o.done) {
            done.innerHTML += itemHtml;
        } else {
            todo.innerHTML += itemHtml;
        }
    });
}

function clearDone() {
    orders = orders.filter(o => !o.done);
    saveData();
    renderOrders();
}

// --- 4. SALES LOGIC (TAB 1) ---
function renderSales() {
    const display = document.getElementById('salesTotalDisplay');
    const filter = document.getElementById('salesFilter').value;
    if (!display) return;

    const now = new Date();
    let totalRevenue = 0;

    const filteredSales = sales.filter(s => {
        const sDate = new Date(s.date);
        const diffTime = Math.abs(now - sDate);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (filter === 'today') return diffDays <= 1 && sDate.getDate() === now.getDate();
        if (filter === '3days') return diffDays <= 3;
        if (filter === 'week') return diffDays <= 7;
        if (filter === 'month') return diffDays <= 30;
        return true; // "all"
    });

    filteredSales.forEach(s => totalRevenue += s.totalPrice);
    display.innerText = `$${totalRevenue.toFixed(2)}`;
}

// --- 5. DATA MANAGEMENT ---
function saveData() {
    localStorage.setItem('biz_inventory', JSON.stringify(inventory));
    localStorage.setItem('biz_sales', JSON.stringify(sales));
    localStorage.setItem('biz_orders', JSON.stringify(orders));
}

// --- 6. PAGE INITIALIZATION ---
// This runs automatically whenever any page is loaded
window.onload = function() {
    renderInventory();
    renderOrders();
    renderSales();
};
