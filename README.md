# 💸 Syntecxhub Expenses Tracker

A full-stack expense tracking web application built with React + Vite on the front end and Express + MongoDB on the back end. Features Google OAuth authentication and interactive financial charts.

🌐 **Live Demo:** https://lnkd.in/g_dpz5Ka
📂 **GitHub Repo:** https://lnkd.in/gc8rm4J4

---

## 📸 Screenshots

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/16bfaadd-f31f-4f8a-868b-795443af7de4" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/53af4009-3d99-48b8-be74-f612371609d9" />

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/20b718e5-37c9-4571-871a-7d0e95177f3f" />

---

## ✨ Features

- 🔐 Google OAuth login (no password needed)
- ➕ Add, edit, and delete expenses and incomes
- 📊 Interactive charts — Daily Comparison, Cumulative, Category Spending, Income, and Comparison
- 📅 Time-range filtering
- 📱 Responsive design — works on desktop and mobile
- 🔒 JWT-secured API endpoints

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI library (functional components + hooks) |
| Vite (v8) | Dev server and bundler |
| Tailwind CSS | Styling |
| Recharts | Charts and data visualization |
| @react-oauth/google | Google OAuth login |
| Axios | HTTP requests to backend |

### Backend
| Technology | Purpose |
|---|---|
| Node.js (v24) | Runtime |
| Express | REST API framework |
| MongoDB + Mongoose | Database and ODM |
| Passport.js | Google OAuth strategy |
| JWT | Authentication tokens |
| CORS + dotenv | Middleware and config |

---
```
## 🏗️ Architecture

Client (React/Vite SPA)

↕ REST API (Axios)

Server (Express on port 5000)

↕ Mongoose ODM

Database (MongoDB Atlas)

**Authentication Flow:**
1. User clicks Google Login
2. Front end obtains Google token via `useGoogleLogin`
3. Token is posted to `/api/users/google-auth`
4. Backend verifies token, creates/updates user in MongoDB
5. Backend returns JWT
6. Front end stores JWT in `localStorage` and attaches it to all Axios requests via interceptor
```
---

## 📁 Project Structure

```
├── client/

│   ├── src/

│   │   ├── api/            # API helper (BASE_URL, loginUser, registerUser)

│   │   ├── assets/         # Images (slide1–6.png, logo.png)

│   │   ├── components/     # Login, ExpenseForm, ExpenseList, IncomeForm, Summary, Modals

│   │   ├── charts/         # DailyComparisonChart, CumulativeChart, CategorySpendingChart, etc.

│   │   ├── hooks/

│   │   │   └── useExpenses.js  # Core data hook — fetch, filter, CRUD, totals

│   │   └── App.jsx

│

├── server/

│   ├── controllers/        # googleAuthController.js, expenseController.js

│   ├── models/             # userModel.js, Expense.js, Income.js

│   ├── routes/             # userRoute.js, googleAuth.js, expenseRoute.js

│   ├── middleware/         # authMiddleware.js (JWT verification)

│   └── server.js           # Entry point — Express setup, MongoDB connection
```
---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google OAuth credentials (from [Google Cloud Console](https://console.cloud.google.com))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/syntecxhub-expenses-tracker.git
cd syntecxhub-expenses-tracker
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
Start the server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## 🌍 Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel / Netlify (static build) |
| Backend | Render (`syntecxhub-expenses-tracker.onrender.com`) |
| Database | MongoDB Atlas |

---

## 📦 Key Packages

`react` `vite` `tailwindcss` `recharts` `@react-oauth/google` `axios` `express` `mongoose` `passport-google-oauth20` `jsonwebtoken` `dotenv` `cors` `nodemon`

---

## 🔮 Planned Features

- [ ] Budget limits and overspend alerts
- [ ] Multi-currency support
- [ ] PDF / CSV export
- [ ] Dark mode

---

## 👤 Author

**Syntecxhub**  
🔗 [GitHub](https://lnkd.in/gc8rm4J4)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

