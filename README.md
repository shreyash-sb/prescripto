# 🩺 Prescripto — Doctor Appointment Booking Platform

Prescripto is a full-stack MERN healthcare appointment management platform connecting patients, doctors, and administrators with automated slot scheduling and digital prescriptions.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Local Development (Single Command)
```bash
npm run dev
```

| Portal | URL | Description |
| :--- | :--- | :--- |
| **Patient Portal** | `http://localhost:5173` | Browse doctors, book slots, view digital prescriptions |
| **Admin & Doctor Portal** | `http://localhost:5174` | Doctor clinical queue & hospital admin dashboard |
| **Backend REST API** | `http://localhost:5000` | Express API server & health check |

---

## ✨ Features

- **For Patients (`:5173`)**: Search doctors by specialty, book 7-day consultation slots, simulate UPI/Card payment, and view/print digital E-Prescriptions and invoices.
- **For Doctors (`:5174`)**: Manage consultation queue, write E-Prescriptions with clinical notes, record offline payments, and set availability/leave dates.
- **For Admins (`:5174`)**: View hospital analytics, add/remove doctors with image upload, manage all appointments, and verify payments.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router v6
- **Backend**: Node.js, Express.js, JWT, Bcrypt, Multer, Cloudinary
- **Database**: MongoDB (Mongoose ODM)

---

## 🔑 Demo Login Credentials

| Role | Portal | Email | Password | Passkey |
| :--- | :--- | :--- | :--- | :--- |
| **Hospital Admin** | `:5174` | `admin@example.com` | `admin12345` | `ADMIN123` |
| **Doctor** | `:5174` | `doctor@example.com` | `doctor12345` | — |
| **Patient** | `:5173` | `patient@example.com` | `patient12345` | — |

*(Quick 1-click auto-fill buttons are also available directly on the login pages)*

---

## ⚙️ Environment Variables (.env)

### Backend (`Backend/.env`)
```env
PORT=5000
MONGODB_URL=mongodb://127.0.0.1:27017/prescripto
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345
ADMIN_SECRET_KEY=ADMIN123
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### Patient Frontend (`frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Admin & Doctor Portal (`admin/.env`)
```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## 📁 Project Structure

```text
8doc-appointment/
├── Backend/                 # Express REST API (Controllers, Routes, Models, Config)
├── frontend/                # Patient React Application (Vite + Tailwind)
├── admin/                   # Admin & Doctor React Application (Vite + Tailwind)
├── package.json             # Root monorepo scripts
└── README.md                # Documentation
```
