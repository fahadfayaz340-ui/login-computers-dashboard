// Login Computers - Shop Management Dashboard Logic

// --- Global Application State ---
const DEFAULT_STATE = {
    tickets: [
        {
            id: "JOB-101",
            customerName: "Faisal Ahmad",
            customerPhone: "9906123456",
            deviceType: "laptop",
            deviceModel: "Dell Inspiron 15 3520",
            problem: "Very slow booting, taking 5 minutes to reach desktop.",
            service: "SSD Upgrade (Super Fast Boot)",
            cost: 2500,
            advance: 500,
            status: "delivered",
            date: "2026-06-25",
            notes: "Installed Crucial 240GB SSD. Cloned OS from old HDD. Working fast."
        },
        {
            id: "JOB-102",
            customerName: "Arsalan Shah",
            customerPhone: "7006789123",
            deviceType: "laptop",
            deviceModel: "HP Pavilion x360",
            problem: "Screen flickering and cracked on the left corner.",
            service: "Screen Replacement",
            cost: 3800,
            advance: 1000,
            status: "completed",
            date: "2026-06-26",
            notes: "Fitted original HP 30-pin FHD screen. Screen test completed. Customer notified."
        },
        {
            id: "JOB-103",
            customerName: "Zubair Rather",
            customerPhone: "9622001122",
            deviceType: "desktop",
            deviceModel: "Office PC Core i3",
            problem: "Powers on, CPU fan spins, but no display on monitor.",
            service: "Dead Motherboard Diagnostics/Fix",
            cost: 1800,
            advance: 0,
            status: "progress",
            date: "2026-06-27",
            notes: "Checked RAM slots. Replaced BIOS CMOS cell. Testing motherboard VRM phases."
        },
        {
            id: "JOB-104",
            customerName: "Ishfaq Bhat",
            customerPhone: "9906887766",
            deviceType: "gaming",
            deviceModel: "Ryzen 5 Custom RGB Rig",
            problem: "Overheating (reaching 95C) and restarting during gaming.",
            service: "Thermal Paste & Dust Cleaning",
            cost: 800,
            advance: 0,
            status: "pending",
            date: "2026-06-27",
            notes: "Dusting fan radiators. Reapplying thermal paste (Thermal Grizzly Hydronaut)."
        }
    ],
    inventory: [
        { id: "inv-1", name: "Crucial BX500 240GB SATA SSD", category: "SSD", price: 2200, stock: 8, minStock: 3 },
        { id: "inv-2", name: "Kingston NV2 500GB NVMe M.2 SSD", category: "SSD", price: 3800, stock: 5, minStock: 2 },
        { id: "inv-3", name: "Crucial 8GB DDR4 3200MHz Laptop RAM", category: "RAM", price: 1800, stock: 2, minStock: 3 },
        { id: "inv-4", name: "HP Laptop Keyboard (Generic)", category: "Keyboard", price: 1200, stock: 4, minStock: 2 },
        { id: "inv-5", name: "Thermal Grizzly Hydronaut Paste (1g)", category: "Thermal Paste", price: 650, stock: 12, minStock: 4 },
        { id: "inv-6", name: "D-Link 300Mbps Wireless N Router", category: "Networking", price: 1150, stock: 3, minStock: 2 }
    ],
    invoiceItems: [] // Temporary builder cache
};

let state = {};

// --- Load and Save state ---
function loadState() {
    const saved = localStorage.getItem("login_computers_dashboard_state");
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse local storage, resetting to default.", e);
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    } else {
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        saveState();
    }
}

function saveState() {
    localStorage.setItem("login_computers_dashboard_state", JSON.stringify(state));
}

// --- Authentication & Overlay System ---
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    if (isLoggedIn) {
        document.documentElement.classList.add("is-logged-in");
    } else {
        document.documentElement.classList.remove("is-logged-in");
    }
    return isLoggedIn;
}

function handleOverlayLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("overlayUsername").value.trim();
    const passVal = document.getElementById("overlayPassword").value.trim();
    const errorEl = document.getElementById("overlayErrorMessage");

    const isUserValid = (userVal.toLowerCase() === "admin" || userVal.toLowerCase() === "admin@logincomputers.com");
    const isPassValid = (passVal === "9906405769");

    if (isUserValid && isPassValid) {
        sessionStorage.setItem("userLoggedIn", "true");
        sessionStorage.setItem("currentUser", "admin");
        if (errorEl) errorEl.style.display = "none";

        // Unhide app & initialize view
        checkAuthStatus();

        if (window.lucide) window.lucide.createIcons();
        renderDashboard();
        updateCountsAndStats();
    } else {
        if (errorEl) {
            errorEl.textContent = "Access Denied: Incorrect username or password.";
            errorEl.style.display = "block";
        }
    }
}

function logoutUser() {
    if (confirm("Are you sure you want to log out of Login Computers Dashboard?")) {
        sessionStorage.removeItem("userLoggedIn");
        sessionStorage.removeItem("currentUser");
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("currentUser");

        // Clear password input field
        const passIn = document.getElementById("overlayPassword");
        const errorEl = document.getElementById("overlayErrorMessage");
        if (passIn) passIn.value = "";
        if (errorEl) errorEl.style.display = "none";

        // Immediately show login overlay and hide app
        checkAuthStatus();
    }
}

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
    loadState();

    // Check overlay auth status
    checkAuthStatus();

    // Wire up overlay form submit
    const overlayForm = document.getElementById("overlayLoginForm");
    if (overlayForm) {
        overlayForm.addEventListener("submit", handleOverlayLogin);
    }

    initRouter();
    renderDashboard();
    initFormsAndModals();
    initInvoiceBuilder();

    // Wire logout buttons
    const headerLogout = document.getElementById("logout-btn");
    if (headerLogout) {
        headerLogout.addEventListener("click", logoutUser);
    }
    const sidebarLogout = document.getElementById("sidebar-logout-btn");
    if (sidebarLogout) {
        sidebarLogout.addEventListener("click", logoutUser);
    }

    // Set current date in header
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('en-US', dateOptions);
    }

    // Render initial counts
    updateCountsAndStats();
});

// --- Simple Routing System ---
function initRouter() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".view-section");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = item.getAttribute("data-target");
            
            navItems.forEach(i => i.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));
            
            item.classList.add("active");
            document.getElementById(targetView).classList.add("active");
            
            // Trigger specific page renders
            if (targetView === "dashboard-view") {
                renderDashboard();
            } else if (targetView === "repairs-view") {
                renderRepairs();
            } else if (targetView === "inventory-view") {
                renderInventory();
            } else if (targetView === "invoice-view") {
                renderInvoiceCreator();
            }
            
            // Re-render lucide icons
            if (window.lucide) {
                window.lucide.createIcons();
            }
        });
    });
}

// --- Toast Notification Helpers ---
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "check-circle";
    if (type === "warning") icon = "alert-triangle";
    if (type === "danger") icon = "x-circle";
    
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    // Slide out and remove
    setTimeout(() => {
        toast.style.transform = "translateX(120%)";
        toast.style.opacity = "0";
        toast.style.transition = "all 0.4s ease-out";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// --- Global Stats Calculator ---
function updateCountsAndStats() {
    const tickets = state.tickets;
    const activeJobs = tickets.filter(t => t.status === "pending" || t.status === "progress").length;
    const pendingCount = tickets.filter(t => t.status === "pending").length;
    const completedCount = tickets.filter(t => t.status === "completed").length;
    
    // Earnings calculation
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyEarnings = tickets
        .filter(t => {
            const ticketDate = new Date(t.date);
            return ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.cost, 0);

    // Stock levels
    const lowStockItems = state.inventory.filter(i => i.stock <= i.minStock).length;
    
    // Update headers / badges
    document.getElementById("stat-active-count").textContent = activeJobs;
    document.getElementById("stat-pending-count").textContent = pendingCount;
    document.getElementById("stat-earnings-count").textContent = "₹" + monthlyEarnings;
    document.getElementById("stat-low-stock-count").textContent = lowStockItems;
}

// --- Render Dashboard View ---
function renderDashboard() {
    updateCountsAndStats();
    
    // Update recent repairs table
    const tableBody = document.getElementById("recent-repairs-table-body");
    tableBody.innerHTML = "";
    
    // Sort tickets descending by date
    const sorted = [...state.tickets].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    if (sorted.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No repair jobs logged yet.</td></tr>`;
        return;
    }
    
    sorted.forEach(t => {
        let deviceIcon = "laptop";
        if (t.deviceType === "desktop") deviceIcon = "monitor";
        if (t.deviceType === "gaming") deviceIcon = "cpu";
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${t.id}</strong></td>
            <td>
                <div class="device-tag">
                    <i data-lucide="${deviceIcon}"></i>
                    <span>${t.deviceModel}</span>
                </div>
            </td>
            <td>${t.customerName}</td>
            <td><span class="status-badge ${t.status}"><span class="status-badge-dot"></span>${t.status}</span></td>
            <td>₹${t.cost}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-action" onclick="viewTicketDetails('${t.id}')" title="View Details"><i data-lucide="eye"></i></button>
                    <button class="btn-action btn-whatsapp-action" onclick="sendWhatsAppUpdate('${t.id}')" title="WhatsApp Customer"><i data-lucide="message-square"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    // Render Earnings Chart progress bars
    renderDashboardCharts();
}

function renderDashboardCharts() {
    // Generate breakdown status percentages
    const total = state.tickets.length;
    const pending = state.tickets.filter(t => t.status === "pending").length;
    const progress = state.tickets.filter(t => t.status === "progress").length;
    const completed = state.tickets.filter(t => t.status === "completed").length;
    const delivered = state.tickets.filter(t => t.status === "delivered").length;
    
    const pctPending = total > 0 ? (pending / total * 100) : 0;
    const pctProgress = total > 0 ? (progress / total * 100) : 0;
    const pctCompleted = total > 0 ? ((completed + delivered) / total * 100) : 0;
    
    document.getElementById("bar-pending-fill").style.width = `${pctPending}%`;
    document.getElementById("bar-pending-label").textContent = `${pending} Jobs (${Math.round(pctPending)}%)`;
    
    document.getElementById("bar-progress-fill").style.width = `${pctProgress}%`;
    document.getElementById("bar-progress-label").textContent = `${progress} Jobs (${Math.round(pctProgress)}%)`;
    
    document.getElementById("bar-completed-fill").style.width = `${pctCompleted}%`;
    document.getElementById("bar-completed-label").textContent = `${completed + delivered} Jobs (${Math.round(pctCompleted)}%)`;
}

// --- Render Repairs List View ---
let currentRepairsFilter = "all";
let repairsSearchQuery = "";

function renderRepairs() {
    const listBody = document.getElementById("repairs-table-body");
    listBody.innerHTML = "";
    
    let filtered = state.tickets;
    
    // Filter by Status
    if (currentRepairsFilter !== "all") {
        filtered = filtered.filter(t => t.status === currentRepairsFilter);
    }
    
    // Search filter
    if (repairsSearchQuery) {
        const query = repairsSearchQuery.toLowerCase();
        filtered = filtered.filter(t => 
            t.customerName.toLowerCase().includes(query) || 
            t.customerPhone.includes(query) || 
            t.deviceModel.toLowerCase().includes(query) || 
            t.id.toLowerCase().includes(query)
        );
    }
    
    if (filtered.length === 0) {
        listBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 32px;">No matching repair jobs found.</td></tr>`;
        return;
    }
    
    // Sort chronological descending
    filtered.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    filtered.forEach(t => {
        let deviceIcon = "laptop";
        if (t.deviceType === "desktop") deviceIcon = "monitor";
        if (t.deviceType === "gaming") deviceIcon = "cpu";
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>#${t.id}</strong></td>
            <td>
                <div class="device-tag">
                    <i data-lucide="${deviceIcon}"></i>
                    <span>${t.deviceModel}</span>
                </div>
            </td>
            <td>${t.customerName}</td>
            <td>${t.customerPhone}</td>
            <td><span class="status-badge ${t.status}"><span class="status-badge-dot"></span>${t.status}</span></td>
            <td>₹${t.cost}</td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-action" onclick="viewTicketDetails('${t.id}')" title="View/Edit Details"><i data-lucide="edit-3"></i></button>
                    <button class="btn-action btn-whatsapp-action" onclick="sendWhatsAppUpdate('${t.id}')" title="Send WhatsApp Update"><i data-lucide="message-square"></i></button>
                    <button class="btn-action" onclick="deleteTicketConfirm('${t.id}')" title="Delete Ticket" style="color: #f43f5e;"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;
        listBody.appendChild(tr);
    });
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Filter button clicks
function filterRepairs(status) {
    currentRepairsFilter = status;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.textContent.toLowerCase().includes(status) || (status === "all" && btn.textContent.toLowerCase().includes("all"))) {
            btn.classList.add("active");
        }
    });
    renderRepairs();
}

// --- Render Inventory View ---
let inventorySearchQuery = "";

function renderInventory() {
    const grid = document.getElementById("inventory-table-body");
    grid.innerHTML = "";
    
    const warningBox = document.getElementById("low-stock-alert-container");
    warningBox.innerHTML = "";
    
    let filtered = state.inventory;
    
    if (inventorySearchQuery) {
        const query = inventorySearchQuery.toLowerCase();
        filtered = filtered.filter(i => 
            i.name.toLowerCase().includes(query) || 
            i.category.toLowerCase().includes(query)
        );
    }
    
    // Draw Low Stock alert if any
    const lowStock = state.inventory.filter(i => i.stock <= i.minStock);
    if (lowStock.length > 0) {
        warningBox.style.display = "flex";
        warningBox.innerHTML = `
            <i data-lucide="alert-triangle"></i>
            <div>
                <strong>Low Stock Alert!</strong> ${lowStock.length} items are running below minimum stock requirements. Reorder soon.
            </div>
        `;
    } else {
        warningBox.style.display = "none";
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 32px;">No inventory items found.</td></tr>`;
        return;
    }
    
    filtered.forEach(i => {
        const isLow = i.stock <= i.minStock;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${i.id.toUpperCase()}</strong></td>
            <td>${i.name}</td>
            <td><span class="badge" style="margin-bottom:0; background:rgba(255,255,255,0.03); color:var(--text-main); border-color:var(--border-color); text-transform:none;">${i.category}</span></td>
            <td>₹${i.price}</td>
            <td>
                <span class="status-badge ${isLow ? 'pending' : 'completed'}">
                    <span class="status-badge-dot"></span>${i.stock} units
                </span>
            </td>
            <td>
                <div class="btn-action-group">
                    <button class="btn-action" onclick="openEditInventoryModal('${i.id}')" title="Edit stock"><i data-lucide="edit"></i></button>
                    <button class="btn-action" onclick="deleteInventoryItem('${i.id}')" title="Remove Item" style="color: #f43f5e;"><i data-lucide="trash-2"></i></button>
                </div>
            </td>
        `;
        grid.appendChild(tr);
    });
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// --- Ticket Management Modals & Drawers ---
let editingTicketId = null;

function viewTicketDetails(id) {
    const ticket = state.tickets.find(t => t.id === id);
    if (!ticket) return;
    
    editingTicketId = id;
    
    // Load data into details drawer/overlay
    document.getElementById("drawer-ticket-id").textContent = ticket.id;
    document.getElementById("drawer-customer-name").textContent = ticket.customerName;
    document.getElementById("drawer-customer-phone").textContent = ticket.customerPhone;
    document.getElementById("drawer-device-model").textContent = ticket.deviceModel;
    document.getElementById("drawer-problem").textContent = ticket.problem;
    document.getElementById("drawer-service").textContent = ticket.service;
    
    // Cost breakdown
    document.getElementById("drawer-cost").textContent = "₹" + ticket.cost;
    document.getElementById("drawer-advance").textContent = "₹" + ticket.advance;
    document.getElementById("drawer-balance").textContent = "₹" + (ticket.cost - ticket.advance);
    
    // Status selection
    document.getElementById("drawer-status-select").value = ticket.status;
    document.getElementById("drawer-notes").value = ticket.notes || "";
    
    // Update WA action links
    const textMsg = encodeURIComponent(`Hi ${ticket.customerName}, this is Login Computers. Your ${ticket.deviceModel} repair status is now: ${ticket.status.toUpperCase()}. Total Bill: ₹${ticket.cost} (Paid: ₹${ticket.advance}, Balance: ₹${ticket.cost - ticket.advance}). Details: ${ticket.notes || 'None'}`);
    document.getElementById("drawer-wa-btn").href = `https://wa.me/91${ticket.customerPhone}?text=${textMsg}`;
    
    // Slide Drawer in
    document.getElementById("details-drawer-overlay").classList.add("active");
    document.getElementById("details-drawer").classList.add("active");
}

function closeDetailsDrawer() {
    document.getElementById("details-drawer-overlay").classList.remove("active");
    document.getElementById("details-drawer").classList.remove("active");
    editingTicketId = null;
}

// Save ticket status from details drawer
function saveTicketStatusChange() {
    if (!editingTicketId) return;
    
    const ticket = state.tickets.find(t => t.id === editingTicketId);
    if (ticket) {
        const oldStatus = ticket.status;
        const newStatus = document.getElementById("drawer-status-select").value;
        ticket.status = newStatus;
        ticket.notes = document.getElementById("drawer-notes").value;
        
        saveState();
        updateCountsAndStats();
        renderDashboard();
        renderRepairs();
        showToast(`Ticket ${ticket.id} status updated to ${newStatus}.`);
        
        // If status changed to delivered, offer to log as a sale or deduct parts stock
        if (oldStatus !== "delivered" && newStatus === "delivered") {
            showToast("Repair marked as delivered & final payment settled.", "success");
        }
        
        closeDetailsDrawer();
    }
}

// Delete Ticket
function deleteTicketConfirm(id) {
    if (confirm(`Are you sure you want to delete repair ticket #${id}?`)) {
        state.tickets = state.tickets.filter(t => t.id !== id);
        saveState();
        updateCountsAndStats();
        renderDashboard();
        renderRepairs();
        showToast(`Ticket #${id} deleted successfully.`, "warning");
    }
}

// Direct quick send whatsapp
function sendWhatsAppUpdate(id) {
    const ticket = state.tickets.find(t => t.id === id);
    if (!ticket) return;
    
    const textMsg = encodeURIComponent(`Dear ${ticket.customerName}, your repair job #${ticket.id} (${ticket.deviceModel}) status update:\n\n*Status:* ${ticket.status.toUpperCase()}\n*Diagnostics/Notes:* ${ticket.notes || 'Under review'}\n*Total Cost:* ₹${ticket.cost}\n*Advance Paid:* ₹${ticket.advance}\n*Balance Due:* ₹${ticket.cost - ticket.advance}\n\nThank you for choosing Login Computers, Chadoora.`);
    
    const url = `https://wa.me/91${ticket.customerPhone}?text=${textMsg}`;
    window.open(url, "_blank");
}

// --- Initialize Forms and Event Handlers ---
function initFormsAndModals() {
    // Modal toggle listeners
    const openJobModalBtn = document.getElementById("open-new-job-modal-btn");
    const openInventoryModalBtn = document.getElementById("open-new-inventory-modal-btn");
    const jobModal = document.getElementById("new-job-modal");
    const inventoryModal = document.getElementById("new-inventory-modal");
    
    openJobModalBtn.addEventListener("click", () => {
        // Clear form
        document.getElementById("new-job-form").reset();
        // Generate new Ticket ID
        const nextId = "JOB-" + (Math.max(...state.tickets.map(t => parseInt(t.id.replace("JOB-", "")))) + 1);
        document.getElementById("new-job-id").value = nextId;
        
        jobModal.classList.add("active");
    });
    
    openInventoryModalBtn.addEventListener("click", () => {
        document.getElementById("new-inventory-form").reset();
        document.getElementById("new-inventory-id").value = "inv-" + (state.inventory.length + 1);
        inventoryModal.classList.add("active");
    });
    
    // Close modal listener
    document.querySelectorAll(".close-modal-btn, .btn-close-modal").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
        });
    });
    
    // New Job Form Submission
    document.getElementById("new-job-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const newTicket = {
            id: document.getElementById("new-job-id").value,
            customerName: document.getElementById("cust-name").value,
            customerPhone: document.getElementById("cust-phone").value,
            deviceType: document.getElementById("dev-type").value,
            deviceModel: document.getElementById("dev-model").value,
            problem: document.getElementById("dev-problem").value,
            service: document.getElementById("dev-service").value,
            cost: parseFloat(document.getElementById("dev-cost").value || 0),
            advance: parseFloat(document.getElementById("dev-advance").value || 0),
            status: document.getElementById("dev-status").value,
            date: new Date().toISOString().split('T')[0],
            notes: document.getElementById("dev-notes").value
        };
        
        state.tickets.push(newTicket);
        saveState();
        updateCountsAndStats();
        renderDashboard();
        renderRepairs();
        
        jobModal.classList.remove("active");
        showToast(`Job ticket ${newTicket.id} created successfully.`);
        
        // Auto offer to open WhatsApp
        if (confirm("Would you like to send a receipt SMS via WhatsApp to the customer?")) {
            sendWhatsAppUpdate(newTicket.id);
        }
    });

    // New Inventory Form Submission
    document.getElementById("new-inventory-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        const editId = document.getElementById("editing-inv-id").value;
        
        if (editId) {
            // Edit existing item
            const item = state.inventory.find(i => i.id === editId);
            if (item) {
                item.name = document.getElementById("inv-name").value;
                item.category = document.getElementById("inv-category").value;
                item.price = parseFloat(document.getElementById("inv-price").value || 0);
                item.stock = parseInt(document.getElementById("inv-stock").value || 0);
                item.minStock = parseInt(document.getElementById("inv-min-stock").value || 0);
                showToast("Inventory item updated successfully.");
            }
        } else {
            // Add new item
            const newItem = {
                id: document.getElementById("new-inventory-id").value,
                name: document.getElementById("inv-name").value,
                category: document.getElementById("inv-category").value,
                price: parseFloat(document.getElementById("inv-price").value || 0),
                stock: parseInt(document.getElementById("inv-stock").value || 0),
                minStock: parseInt(document.getElementById("inv-min-stock").value || 0)
            };
            state.inventory.push(newItem);
            showToast(`Inventory item ${newItem.name} added.`);
        }
        
        saveState();
        updateCountsAndStats();
        renderInventory();
        inventoryModal.classList.remove("active");
    });
    
    // Setup Search Inputs
    document.getElementById("repairs-search").addEventListener("input", (e) => {
        repairsSearchQuery = e.target.value;
        renderRepairs();
    });
    
    document.getElementById("inventory-search").addEventListener("input", (e) => {
        inventorySearchQuery = e.target.value;
        renderInventory();
    });
}

// Edit inventory stock modal triggers
function openEditInventoryModal(id) {
    const item = state.inventory.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById("editing-inv-id").value = item.id;
    document.getElementById("inv-name").value = item.name;
    document.getElementById("inv-category").value = item.category;
    document.getElementById("inv-price").value = item.price;
    document.getElementById("inv-stock").value = item.stock;
    document.getElementById("inv-min-stock").value = item.minStock;
    
    document.getElementById("inventory-modal-title").textContent = "Edit Stock Item";
    document.getElementById("new-inventory-modal").classList.add("active");
}

function deleteInventoryItem(id) {
    if (confirm("Are you sure you want to remove this item from the inventory registry?")) {
        state.inventory = state.inventory.filter(i => i.id !== id);
        saveState();
        updateCountsAndStats();
        renderInventory();
        showToast("Item deleted from inventory.", "warning");
    }
}

// --- Invoice Builder Panel & Receipt Printing ---
let invoiceLines = [];

function initInvoiceBuilder() {
    // Populate stock item select autocomplete dropdown
    const itemSelect = document.getElementById("inv-select-item");
    itemSelect.innerHTML = `<option value="">-- Choose Inventory Item / Spare Part --</option>`;
    
    state.inventory.forEach(i => {
        const option = document.createElement("option");
        option.value = i.id;
        option.setAttribute("data-price", i.price);
        option.textContent = `${i.name} (Stock: ${i.stock}) - ₹${i.price}`;
        itemSelect.appendChild(option);
    });
}

function renderInvoiceCreator() {
    initInvoiceBuilder();
    
    // Fill bill number
    const billNum = "INV-" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById("invoice-number-val").textContent = billNum;
    
    // Fill bill date
    document.getElementById("invoice-date-val").textContent = new Date().toLocaleDateString();
    
    renderInvoiceLines();
}

function addSelectedItemToInvoice() {
    const itemSelect = document.getElementById("inv-select-item");
    const itemId = itemSelect.value;
    
    if (!itemId) {
        showToast("Please choose an item first", "danger");
        return;
    }
    
    const quantity = parseInt(document.getElementById("inv-item-qty").value || 1);
    const stockItem = state.inventory.find(i => i.id === itemId);
    
    if (stockItem) {
        // Check stock availability
        if (stockItem.stock < quantity) {
            if (!confirm(`Warning: Stock only has ${stockItem.stock} items left. Do you want to proceed?`)) {
                return;
            }
        }
        
        // Add to rows
        const existing = invoiceLines.find(line => line.id === itemId);
        if (existing) {
            existing.qty += quantity;
        } else {
            invoiceLines.push({
                id: itemId,
                name: stockItem.name,
                price: stockItem.price,
                qty: quantity
            });
        }
        
        renderInvoiceLines();
        itemSelect.value = "";
        document.getElementById("inv-item-qty").value = 1;
        showToast(`${stockItem.name} added to invoice list.`);
    }
}

function addCustomLineToInvoice() {
    const name = document.getElementById("inv-custom-desc").value;
    const price = parseFloat(document.getElementById("inv-custom-price").value || 0);
    const qty = parseInt(document.getElementById("inv-custom-qty").value || 1);
    
    if (!name || price <= 0) {
        showToast("Please enter a valid description and price.", "danger");
        return;
    }
    
    const customId = "custom-" + Date.now();
    invoiceLines.push({
        id: customId,
        name: name,
        price: price,
        qty: qty
    });
    
    renderInvoiceLines();
    
    // Reset inputs
    document.getElementById("inv-custom-desc").value = "";
    document.getElementById("inv-custom-price").value = "";
    document.getElementById("inv-custom-qty").value = 1;
    showToast("Custom labor/service charges added.");
}

function removeInvoiceLine(id) {
    invoiceLines = invoiceLines.filter(line => line.id !== id);
    renderInvoiceLines();
}

function renderInvoiceLines() {
    const list = document.getElementById("invoice-lines-list");
    list.innerHTML = "";
    
    let subtotal = 0;
    
    if (invoiceLines.length === 0) {
        list.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No bill items added yet. Use panels above.</td></tr>`;
        updateInvoicePreview(0);
        return;
    }
    
    invoiceLines.forEach((line, idx) => {
        const itemTotal = line.price * line.qty;
        subtotal += itemTotal;
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${line.name}</td>
            <td>₹${line.price}</td>
            <td>${line.qty}</td>
            <td style="display:flex; justify-content:space-between; align-items:center;">
                ₹${itemTotal}
                <button class="btn-delete-row" onclick="removeInvoiceLine('${line.id}')"><i data-lucide="minus-circle"></i></button>
            </td>
        `;
        list.appendChild(tr);
    });
    
    updateInvoicePreview(subtotal);
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function updateInvoicePreview(subtotal) {
    const discount = parseFloat(document.getElementById("invoice-discount-input").value || 0);
    const grandTotal = Math.max(0, subtotal - discount);
    
    document.getElementById("invoice-subtotal-val").textContent = "₹" + subtotal;
    document.getElementById("invoice-grand-val").textContent = "₹" + grandTotal;
    
    // Render actual printable preview card values
    const custName = document.getElementById("invoice-cust-name").value || "Walk-in Customer";
    const custPhone = document.getElementById("invoice-cust-phone").value || "N/A";
    
    document.getElementById("preview-customer-name").textContent = custName;
    document.getElementById("preview-customer-phone").textContent = custPhone;
    
    const previewList = document.getElementById("preview-items-list");
    previewList.innerHTML = "";
    
    invoiceLines.forEach(line => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${line.name}</td>
            <td>${line.qty}</td>
            <td>₹${line.price}</td>
            <td>₹${line.price * line.qty}</td>
        `;
        previewList.appendChild(tr);
    });
    
    document.getElementById("preview-subtotal").textContent = "₹" + subtotal;
    document.getElementById("preview-discount").textContent = "-₹" + discount;
    document.getElementById("preview-grand").textContent = "₹" + grandTotal;
}

// Watch inputs to update live preview
document.getElementById("invoice-cust-name").addEventListener("input", () => renderInvoiceLines());
document.getElementById("invoice-cust-phone").addEventListener("input", () => renderInvoiceLines());
document.getElementById("invoice-discount-input").addEventListener("input", () => renderInvoiceLines());

// Finalize sale & print receipt
function printReceipt() {
    if (invoiceLines.length === 0) {
        showToast("Cannot print empty invoice", "danger");
        return;
    }
    
    // Deduct stock for inventory items sold
    invoiceLines.forEach(line => {
        if (!line.id.startsWith("custom-")) {
            const item = state.inventory.find(i => i.id === line.id);
            if (item) {
                item.stock = Math.max(0, item.stock - line.qty);
            }
        }
    });
    
    saveState();
    
    // Trigger System Print Dialogue
    window.print();
    
    showToast("Invoice processed and stock balances updated.");
    
    // Ask to send Invoice SMS via WhatsApp
    if (confirm("Invoice printed successfully! Would you like to share this bill summary on the customer's WhatsApp?")) {
        shareInvoiceWhatsApp();
    }
}

function shareInvoiceWhatsApp() {
    const custName = document.getElementById("invoice-cust-name").value || "Customer";
    const custPhone = document.getElementById("invoice-cust-phone").value;
    const billNum = document.getElementById("invoice-number-val").textContent;
    
    if (!custPhone) {
        showToast("Please specify customer phone number to send WhatsApp.", "danger");
        return;
    }
    
    let subtotal = 0;
    let itemsText = "";
    invoiceLines.forEach(line => {
        const itemTotal = line.price * line.qty;
        subtotal += itemTotal;
        itemsText += `\n- ${line.name} (x${line.qty}): ₹${itemTotal}`;
    });
    
    const discount = parseFloat(document.getElementById("invoice-discount-input").value || 0);
    const grandTotal = subtotal - discount;
    
    const waText = encodeURIComponent(`*INVOICE SUMMARY*\n*Login Computers, Chadoora*\n\nBill No: ${billNum}\nCustomer: ${custName}\n----------------------------------\n*Items:*${itemsText}\n----------------------------------\n*Subtotal:* ₹${subtotal}\n*Discount:* -₹${discount}\n*Grand Total:* *₹${grandTotal}*\n\nThank you for shopping at Login Computers! For support, call 9906405769.`);
    
    const url = `https://wa.me/91${custPhone}?text=${waText}`;
    window.open(url, "_blank");
}
