# Login Computers - Shop Management & Repair Tracker Dashboard

A premium, responsive, and highly interactive admin application built for **Login Computers** (located in Chadoora, Budgam) to manage customer repairs, inventory stock, calculate monthly earnings, and generate invoices with WhatsApp sharing.

## 🚀 Key Features

1. **Dashboard Home View**:
   - **Key Metrics**: Real-time counter of Active Repairs, Pending Diagnostics, Monthly Shop Earnings, and Low Stock Alerts.
   - **Job Distribution Tracker**: Beautiful visual progress bars demonstrating the ratio of pending, progress, and completed jobs.
   - **Recent Repair Tickets**: Quick overview of recent customer check-ins with one-click status lookups.

2. **Repair Jobs Tracker**:
   - **Registration**: Simple receipt generation form with customer name, mobile number, device model, problem description, cost estimates, and initial deposits.
   - **Status & Search**: Search tickets by Job ID, customer names, or phone numbers. Filter jobs by lifecycle stage (Pending, In Progress, Completed, Delivered).
   - **Interactive details drawer**: Select any job to update progress notes, edit costs, change status, and open a WhatsApp connection to send status alerts to the customer.

3. **Inventory Stock Registry**:
   - **Categorization**: Group components into SSDs, RAM, Keyboards, CCTV, Routers, etc.
   - **Low Stock Alerter**: Highlight critical levels when spare parts count falls below safe margins.
   - **Real-Time Stock Adjustment**: Automatic reduction of items in stock when they are sold via the Invoice builder.

4. **Interactive Invoice Builder**:
   - **Flexible Billings**: Choose components from the inventory or type custom service charges (e.g. hinge repairs, system dusting).
   - **Auto-Calculations**: Computes subtotal, discounts, and final dues dynamically.
   - **Print Receipts**: Generates an A5/Receipt formatted receipt ready for printing.
   - **WhatsApp Billing Integration**: Instantly formats invoices into clean WhatsApp messages ready to send to customers in one click.

## 🛠️ How to Open and Run

### Method 1: Double-Click (Easiest)
Simply go to the [login-computers-dashboard](file:///C:/Users/fahad/login-computers-dashboard) folder and double-click `index.html` to open it in your Chrome, Edge, Safari, or Firefox browser.

### Method 2: Launch local server (Recommended)
If Python is installed on your computer:
1. Double-click the [serve.py](file:///C:/Users/fahad/login-computers-dashboard/serve.py) script, OR
2. Open PowerShell/Terminal inside `C:\Users\fahad\login-computers-dashboard` and run:
   ```bash
   python serve.py
   ```
This will automatically launch a web server at `http://localhost:8080` and open the app in your default browser.

## 📁 File Structure
- [index.html](file:///C:/Users/fahad/login-computers-dashboard/index.html) - Structural setup, modals, and templates.
- [styles.css](file:///C:/Users/fahad/login-computers-dashboard/styles.css) - Layout styling, glowing neon accents, and print layouts.
- [app.js](file:///C:/Users/fahad/login-computers-dashboard/app.js) - Router, calculations, billing, and WhatsApp messaging integrations.
- [serve.py](file:///C:/Users/fahad/login-computers-dashboard/serve.py) - Automating local browser testing.
