const state = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    activeModule: null
};

const modulesByRole = {
    customer: ['Dashboard', 'Book Service', 'My Bookings', 'Menu'],
    staff: ['Bookings', 'Book Service', 'Schedule'],
    admin: ['Dashboard', 'Bookings', 'Book Service', 'Users', 'Menu', 'Inventory', 'Vendors', 'Reports', 'Audit Logs', 'Settings'],
    vendor: ['Vendor Profile']
};

const pathModules = {
    '/schedule': 'Schedule',
    '/menu': 'Menu',
    '/bookings': 'Bookings',
    '/inventory': 'Inventory',
    '/vendors': 'Vendors',
    '/reports': 'Reports',
    '/settings': 'Settings'
};

const authView = document.getElementById('authView');
const appView = document.getElementById('appView');
const moduleNav = document.getElementById('moduleNav');
const moduleContent = document.getElementById('moduleContent');
const alertArea = document.getElementById('alertArea');
const currentUser = document.getElementById('currentUser');
const logoutButton = document.getElementById('logoutButton');

async function api(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || 'Request failed');
    }

    return data;
}

function showAlert(message, type = 'success') {
    alertArea.innerHTML = `<div class="alert alert-${type}" role="alert">${escapeHtml(message)}</div>`;
    setTimeout(() => {
        alertArea.innerHTML = '';
    }, 3500);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function setSession(token, user) {
    state.token = token;
    state.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    render();
}

function clearSession() {
    state.token = null;
    state.user = null;
    state.activeModule = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    render();
}

function render() {
    if (!state.token || !state.user) {
        authView.classList.remove('d-none');
        appView.classList.add('d-none');
        logoutButton.classList.add('d-none');
        currentUser.textContent = '';
        return;
    }

    authView.classList.add('d-none');
    appView.classList.remove('d-none');
    logoutButton.classList.remove('d-none');
    currentUser.textContent = `${state.user.name} (${state.user.role})`;

    const modules = modulesByRole[state.user.role] || [];
    const pathModule = pathModules[window.location.pathname];
    state.activeModule = state.activeModule || (modules.includes(pathModule) ? pathModule : modules[0]);
    moduleNav.innerHTML = modules.map((module) => `
        <button class="list-group-item list-group-item-action ${module === state.activeModule ? 'active' : ''}" data-module="${module}">
            ${module}
        </button>
    `).join('');

    renderModule();
}

async function renderModule() {
    const module = state.activeModule;
    moduleContent.innerHTML = `<div class="work-panel">Loading ${escapeHtml(module)}...</div>`;

    try {
        if (module === 'Dashboard' && state.user.role === 'admin') return renderAdminDashboard();
        if (module === 'Dashboard') return renderCustomerDashboard();
        if (module === 'Book Service') return renderBookingForm();
        if (module === 'My Bookings' || module === 'Bookings') return renderBookings();
        if (module === 'Menu') return renderMenu();
        if (module === 'Inventory') return renderInventory();
        if (module === 'Vendors') return renderVendors();
        if (module === 'Users') return renderUsers();
        if (module === 'Schedule') return renderSchedule();
        if (module === 'Reports') return renderReports();
        if (module === 'Audit Logs') return renderAuditLogs();
        if (module === 'Settings') return renderSettings();
        if (module === 'Vendor Profile') return renderVendorProfile();
    } catch (error) {
        moduleContent.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
}

async function renderAdminDashboard() {
    const data = await api('/api/admin/dashboard');
    moduleContent.innerHTML = `
        <div class="module-title">Admin Dashboard</div>
        <div class="stat-grid">
            ${statBox('Users', data.totalUsers)}
            ${statBox('Bookings', data.totalBookings)}
            ${statBox('Pending', data.pendingBookings)}
            ${statBox('Approved', data.approvedBookings)}
            ${statBox('Low Stock', data.lowStockItems)}
            ${statBox('Active Vendors', data.activeVendors)}
        </div>
    `;
}

async function renderCustomerDashboard() {
    const data = await api('/api/customer/dashboard');
    moduleContent.innerHTML = `
        <div class="module-title">Customer Dashboard</div>
        <div class="stat-grid">
            ${statBox('Total Bookings', data.bookingSummary.total)}
            ${statBox('Pending', data.bookingSummary.pending)}
            ${statBox('Approved', data.bookingSummary.approved)}
            ${statBox('Cancelled', data.bookingSummary.cancelled)}
        </div>
    `;
}

function renderBookingForm() {
    moduleContent.innerHTML = `
        <div class="module-title">Book Catering Service</div>
        <form id="bookingForm" class="work-panel">
            <div class="row g-3">
                ${state.user.role === 'customer' ? '' : `
                    <div class="col-md-4">
                        <label class="form-label">Customer ID</label>
                        <input class="form-control" name="customerId" type="number" min="1" required>
                    </div>
                `}
                <div class="col-md-6">
                    <label class="form-label">Event date</label>
                    <input class="form-control" name="eventDate" type="date" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Event time</label>
                    <input class="form-control" name="eventTime" type="time">
                </div>
                <div class="col-md-8">
                    <label class="form-label">Venue</label>
                    <input class="form-control" name="venue" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Guests</label>
                    <input class="form-control" name="guests" type="number" min="1" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">Package</label>
                    <input class="form-control" name="packageName">
                </div>
                <div class="col-12">
                    <label class="form-label">Special requests</label>
                    <textarea class="form-control" name="specialRequests" rows="3"></textarea>
                </div>
            </div>
            <button class="btn btn-primary mt-3" type="submit">Submit Booking</button>
        </form>
    `;
}

async function renderBookings() {
    const bookings = await api('/api/bookings');
    const customerTools = state.user.role === 'customer' ? `
        <form id="cancelRequestForm" class="work-panel mb-3">
            <div class="row g-3">
                <div class="col-md-3"><input class="form-control" name="bookingId" type="number" min="1" placeholder="Booking ID" required></div>
                <div class="col-md-7"><input class="form-control" name="reason" placeholder="Cancellation reason" required></div>
                <div class="col-md-2"><button class="btn btn-outline-danger w-100" type="submit">Request</button></div>
            </div>
        </form>
    ` : '';
    const staffTools = ['staff', 'admin'].includes(state.user.role) ? `
        <div class="row g-3 mb-3">
            <div class="col-lg-6">
                <form id="cancelDecisionForm" class="work-panel">
                    <label class="form-label">Cancellation approval</label>
                    <div class="row g-2">
                        <div class="col-4"><input class="form-control" name="bookingId" type="number" min="1" placeholder="Booking ID" required></div>
                        <div class="col-4">
                            <select class="form-select" name="decision">
                                <option value="approved">Approve</option>
                                <option value="rejected">Reject</option>
                            </select>
                        </div>
                        <div class="col-4"><button class="btn btn-primary w-100" type="submit">Save</button></div>
                        <div class="col-12"><input class="form-control" name="notes" placeholder="Review notes"></div>
                    </div>
                </form>
            </div>
            <div class="col-lg-6">
                <form id="billingForm" class="work-panel">
                    <label class="form-label">Billing settlement</label>
                    <div class="row g-2">
                        <div class="col-4"><input class="form-control" name="bookingId" type="number" min="1" placeholder="Booking ID" required></div>
                        <div class="col-4"><input class="form-control" name="totalAmount" type="number" step="0.01" placeholder="Amount"></div>
                        <div class="col-4">
                            <select class="form-select" name="billingStatus">
                                <option value="unbilled">Unbilled</option>
                                <option value="billed">Billed</option>
                                <option value="settled">Settled</option>
                            </select>
                        </div>
                        <div class="col-12"><button class="btn btn-primary w-100" type="submit">Update Billing</button></div>
                    </div>
                </form>
            </div>
        </div>
    ` : '';
    moduleContent.innerHTML = `
        <div class="module-title">Bookings</div>
        ${customerTools}
        ${staffTools}
        ${table(['ID', 'Date', 'Venue', 'Guests', 'Status', 'Cancel Request', 'Billing', 'Amount'], bookings.map((booking) => [
            booking.id,
            booking.eventDate,
            booking.venue,
            booking.guests,
            booking.status,
            booking.cancellationStatus,
            booking.billingStatus,
            booking.totalAmount
        ]))}
    `;
}

async function renderMenu() {
    const items = await api('/api/menu?includeUnavailable=true');
    const adminForm = state.user.role === 'admin' ? `
        <form id="menuForm" class="work-panel mb-3">
            <div class="row g-3">
                <div class="col-md-4"><input class="form-control" name="name" placeholder="Item name" required></div>
                <div class="col-md-3"><input class="form-control" name="category" placeholder="Category" required></div>
                <div class="col-md-3"><input class="form-control" name="pricePerGuest" type="number" step="0.01" placeholder="Price" required></div>
                <div class="col-md-2"><button class="btn btn-primary w-100" type="submit">Add</button></div>
            </div>
        </form>
    ` : '';
    moduleContent.innerHTML = `
        <div class="module-title">Menu</div>
        ${adminForm}
        ${table(['Name', 'Category', 'Price / Guest', 'Available'], items.map((item) => [
            item.name,
            item.category,
            item.pricePerGuest,
            item.isAvailable ? 'Yes' : 'No'
        ]))}
    `;
}

async function renderInventory() {
    const items = await api('/api/inventory');
    const form = `
        <form id="inventoryForm" class="work-panel mb-3">
            <div class="row g-3">
                <div class="col-md-3"><input class="form-control" name="name" placeholder="Item name" required></div>
                <div class="col-md-2"><input class="form-control" name="category" placeholder="Category" required></div>
                <div class="col-md-2"><input class="form-control" name="quantity" type="number" step="0.01" placeholder="Quantity" required></div>
                <div class="col-md-2"><input class="form-control" name="unit" placeholder="Unit" required></div>
                <div class="col-md-2"><input class="form-control" name="reorderLevel" type="number" step="0.01" placeholder="Reorder" required></div>
                <div class="col-md-1"><button class="btn btn-primary w-100" type="submit">Add</button></div>
            </div>
        </form>
    `;
    moduleContent.innerHTML = `
        <div class="module-title">Inventory</div>
        ${form}
        ${table(['Name', 'Category', 'Quantity', 'Unit', 'Reorder Level'], items.map((item) => [
            item.name,
            item.category,
            item.quantity,
            item.unit,
            item.reorderLevel
        ]))}
    `;
}

async function renderVendors() {
    const vendors = await api('/api/vendors');
    moduleContent.innerHTML = `
        <div class="module-title">Vendors</div>
        ${table(['Company', 'Contact', 'Email', 'Phone', 'Status'], vendors.map((vendor) => [
            vendor.companyName,
            vendor.contactPerson,
            vendor.email,
            vendor.phone,
            vendor.status
        ]))}
    `;
}

async function renderUsers() {
    const users = await api('/api/admin/users');
    moduleContent.innerHTML = `
        <div class="module-title">Users</div>
        ${table(['Name', 'Email', 'Role', 'Active'], users.map((user) => [
            user.name,
            user.email,
            user.role,
            user.isActive ? 'Yes' : 'No'
        ]))}
    `;
}

async function renderSchedule() {
    const bookings = await api('/api/schedule');
    moduleContent.innerHTML = `
        <div class="module-title">Schedule</div>
        ${table(['Date', 'Time', 'Customer', 'Venue', 'Guests', 'Status'], bookings.map((booking) => [
            booking.eventDate,
            booking.eventTime || '',
            booking.customer?.name || '',
            booking.venue,
            booking.guests,
            booking.status
        ]))}
    `;
}

async function renderReports() {
    const [bookings, inventory, users] = await Promise.all([
        api('/api/reports/bookings'),
        api('/api/reports/inventory'),
        api('/api/reports/users')
    ]);
    moduleContent.innerHTML = `
        <div class="module-title">Reports</div>
        <div class="row g-3">
            <div class="col-md-4">${reportList('Bookings by Status', bookings.statusCounts, 'status')}</div>
            <div class="col-md-4">${reportList('Users by Role', users.roleCounts, 'role')}</div>
            <div class="col-md-4"><div class="work-panel"><strong>Low Stock Items</strong><div class="display-6">${inventory.lowStockItems.length}</div></div></div>
        </div>
    `;
}

async function renderAuditLogs() {
    const logs = await api('/api/admin/audit-logs?limit=50');
    moduleContent.innerHTML = `
        <div class="module-title">Audit Logs</div>
        ${table(['User', 'Action', 'Entity', 'Date'], logs.map((log) => [
            log.user?.email || 'System',
            log.action,
            log.entity,
            new Date(log.createdAt).toLocaleString()
        ]))}
    `;
}

async function renderSettings() {
    const settings = await api('/api/settings');
    moduleContent.innerHTML = `
        <div class="module-title">Settings</div>
        <form id="settingsForm" class="work-panel mb-3">
            <div class="row g-3">
                <div class="col-md-5"><input class="form-control" name="key" placeholder="Setting key" required></div>
                <div class="col-md-5"><input class="form-control" name="value" placeholder="Value" required></div>
                <div class="col-md-2"><button class="btn btn-primary w-100" type="submit">Save</button></div>
            </div>
        </form>
        ${table(['Key', 'Value'], settings.map((setting) => [setting.key, setting.value]))}
    `;
}

async function renderVendorProfile() {
    const profile = await api('/api/vendors/me');
    moduleContent.innerHTML = `
        <div class="module-title">Vendor Profile</div>
        <form id="vendorProfileForm" class="work-panel">
            <input type="hidden" name="id" value="${escapeHtml(profile?.id || '')}">
            <label class="form-label">Company name</label>
            <input class="form-control mb-3" name="companyName" value="${escapeHtml(profile?.companyName || '')}" required>
            <label class="form-label">Contact person</label>
            <input class="form-control mb-3" name="contactPerson" value="${escapeHtml(profile?.contactPerson || '')}">
            <label class="form-label">Email</label>
            <input class="form-control mb-3" name="email" type="email" value="${escapeHtml(profile?.email || state.user.email)}">
            <label class="form-label">Phone</label>
            <input class="form-control mb-3" name="phone" value="${escapeHtml(profile?.phone || '')}">
            <label class="form-label">Supplied items</label>
            <textarea class="form-control mb-3" name="suppliedItems" rows="3">${escapeHtml(profile?.suppliedItems || '')}</textarea>
            <button class="btn btn-primary" type="submit">Save Profile</button>
        </form>
    `;
}

function statBox(label, value) {
    return `<div class="stat-box"><div class="text-secondary small">${escapeHtml(label)}</div><div class="display-6">${escapeHtml(value)}</div></div>`;
}

function table(headers, rows) {
    if (!rows.length) {
        return '<div class="work-panel text-secondary">No records found.</div>';
    }

    return `
        <div class="table-wrap work-panel">
            <table class="table table-sm align-middle mb-0">
                <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
                <tbody>
                    ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function reportList(title, rows, labelKey) {
    return `
        <div class="work-panel">
            <strong>${escapeHtml(title)}</strong>
            <ul class="list-unstyled mb-0 mt-2">
                ${rows.map((row) => `<li>${escapeHtml(row[labelKey])}: ${escapeHtml(row.count)}</li>`).join('') || '<li class="text-secondary">No data</li>'}
            </ul>
        </div>
    `;
}

function formDataToObject(form) {
    return Object.fromEntries(new FormData(form).entries());
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const data = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });
        setSession(data.token, data.user);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const data = await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                role: document.getElementById('registerRole').value
            })
        });
        setSession(data.token, data.user);
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

moduleNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-module]');
    if (!button) return;
    state.activeModule = button.dataset.module;
    render();
});

moduleContent.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const payload = formDataToObject(form);

    try {
        if (form.id === 'bookingForm') await api('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
        if (form.id === 'cancelRequestForm') {
            const bookingId = payload.bookingId;
            delete payload.bookingId;
            await api(`/api/bookings/${bookingId}/cancel-request`, { method: 'POST', body: JSON.stringify(payload) });
        }
        if (form.id === 'cancelDecisionForm') {
            const bookingId = payload.bookingId;
            delete payload.bookingId;
            await api(`/api/bookings/${bookingId}/cancel-request`, { method: 'PATCH', body: JSON.stringify(payload) });
        }
        if (form.id === 'billingForm') {
            const bookingId = payload.bookingId;
            delete payload.bookingId;
            await api(`/api/bookings/${bookingId}/billing`, { method: 'PATCH', body: JSON.stringify(payload) });
        }
        if (form.id === 'menuForm') await api('/api/menu', { method: 'POST', body: JSON.stringify(payload) });
        if (form.id === 'inventoryForm') await api('/api/inventory', { method: 'POST', body: JSON.stringify(payload) });
        if (form.id === 'settingsForm') await api(`/api/settings/${encodeURIComponent(payload.key)}`, { method: 'PUT', body: JSON.stringify({ value: payload.value }) });
        if (form.id === 'vendorProfileForm') {
            const id = payload.id;
            delete payload.id;
            await api(id ? `/api/vendors/${id}` : '/api/vendors', {
                method: id ? 'PUT' : 'POST',
                body: JSON.stringify(payload)
            });
        }
        showAlert('Saved successfully');
        renderModule();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
});

logoutButton.addEventListener('click', clearSession);

render();
