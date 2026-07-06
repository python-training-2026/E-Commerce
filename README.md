# E-Commerce

# NextGen Store

NextGen Store is a modern, premium e-commerce web application powered by **FastAPI** on the backend and custom **Vanilla CSS** glassmorphic styling on the frontend. The project is designed with rich animations, micro-interactions, and a sleek dark theme.

## Features

- 🌌 **Premium Visuals**: Glassmorphic cards, smooth hover scaling, and floating glowing background orbs.
- 🏷️ **Products Catalog**: Browse and search products, dynamic loading states, and stock availability badges.
- 🔍 **Interactive Product Modals**: Click products to open details overlays showing full description, available inventory levels, and quantity adjustment counters.
- 🛒 **Shopping Cart**: Real-time asynchronous cart management (quantity updates, removals, and clearing) with immediate navbar item badge updates.
- 💳 **Secure 3D Checkout**: Interactive digital credit card mockup that flips visually when inputting CVV credentials and auto-formats card numbers/expiry dates as you type.
- 📦 **Order Tracking History**: Collapsible receipt drawers with details of purchase totals and items bought.
- ⚡ **Asynchronous DB**: Asynchronous database integrations leveraging PostgreSQL and SQLalchemy.

---

## Installation & Setup

Follow these steps to set up and run the application locally on your machine.

### Prerequisites
- **Python 3.10+** (tested and optimized for **Python 3.14** compatibility)
- **PostgreSQL** Database

### 1. Clone & Navigate to Project
Open your terminal and navigate to the project directory:
```bash
cd store-fastapi
```

### 2. Set Up Virtual Environment
Create and activate a virtual environment:

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**On macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install all package requirements listed:
```bash
pip install -r requirements.txt
```

### 4. Database Setup
Ensure your PostgreSQL database is running. Create a new database named `local` (or match it with your `.env`).

Create a `.env` file in the root `store-fastapi` folder and populate it with your Postgres connection info:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=local
```

*Note: Database tables will be generated automatically on the application's first startup hook.*

---

## Running the Application

To run the development server, run `uvicorn` using your Python virtual environment:

```bash
uvicorn main:app --reload --port 8000
```

Once started, the application will be active at:
- **Web App Front:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Swagger Interactive APIs Doc:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
