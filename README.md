# PeerPicks Admin Dashboard 🚀

A professional-grade User Management & Identity Synchronization system built for the PeerPicks ecosystem. This application provides administrators with a high-fidelity interface to manage peer accounts, monitor system-wide activity, and ensure data integrity across the platform.

---

## 🛠 Tech Stack

### Frontend (Peer Interface)
* **Framework:** Next.js 14+ (App Router & Turbopack)
- **Animations:** Framer Motion for high-end transitions
- **Styling:** Tailwind CSS (Optimized for Dark Mode)
- **Icons:** Lucide React
- **State & Data:** Axios with Multipart/Form-Data support

### Backend (Core Logic)
- **Runtime:** Node.js / Express.js
- **Database:** MongoDB via Mongoose
- **Validation:** Zod (Type-safe DTOs and Data Coercion)
- **Security:** Bcrypt (10-round salt hashing)
- **File System:** Multer for local profile picture storage

---

## ✨ Features

### 1. Robust User Management
- **Full CRUD:** Create, Read, Update, and Delete peers with real-time synchronization.
- **Identity Verification:** Zod-powered validation ensures unique emails, valid phone formats, and correct gender enums.
- **Age Governance:** Integrated age calculation logic ensures all registered peers are **13 years or older**.

### 2. High-Fidelity UI/UX
- **Responsive Grids:** Optimized forms for Gender and Date of Birth entry.
- **Native Dark Elements:** Custom `[color-scheme:dark]` utility ensures date pickers and selects match the dashboard aesthetic.
- **Real-time Feedback:** Framer Motion labels and input transitions.

### 3. Enterprise Security
- **Automated Hashing:** All passwords created via the Admin panel are manually hashed using `bcrypt` before database persistence.
- **Type Safety:** TypeScript integration across controllers and repositories to prevent runtime failures.

---

## 📂 Project Structure

├── server/
│   ├── src/
│   │   ├── controllers/    # AdminController logic (Hashing & Parsing)
│   │   ├── dtos/           # Zod Data Transfer Objects
│   │   ├── models/         # Mongoose schemas (IUser interface)
│   │   ├── repositories/   # Database abstraction layer
│   │   └── routes/         # Express API endpoints
│   └── uploads/            # Static storage for profile pictures
├── client/
│   ├── app/
│   │   ├── admin/          # Dashboard & User Management pages
│   │   └── components/     # UI components (Framer-motion optimized)


## ⚙️ Setup & Installation

### Backend Setup

1. Navigate to `/server` and run `npm install`.
2. Create an `.env` file with `MONGODB_URI`, `PORT`, and `JWT_SECRET`.
3. **Crucial:** Create a folder named `uploads` in the root of the server directory to handle Multer storage.
4. Run `npm run dev`.

### Frontend Setup

1. Navigate to `/client` and run `npm install`.
2. Ensure your API endpoint matches the server's local address.
3. Run `npm run dev`.

---

## 🛡 API Endpoints (Admin Only)

| Method | Endpoint | Description |
| --- | --- | --- |
| **GET** | `/api/admin/users` | Fetch all peers and dashboard statistics. |
| **POST** | `/api/admin/users` | Create new peer (Accepts Multipart/Form-Data). |
| **PUT** | `/api/admin/users/:id` | Update peer details and profile images. |
| **DELETE** | `/api/admin/users/:id` | Purge peer identity from the database. |

---

## 📝 Developer Notes

* **Password Handling:** The system uses `bcrypt.genSalt(10)` to secure passwords during the admin creation process.
* **Date Handling:** Frontend strings are converted to JavaScript Date objects using `z.coerce.date()` on the backend.
* **Static Assets:** To view profile pictures, the Express app serves the `uploads` folder via `express.static('uploads')`.

---

© 2026 PeerPicks Development Team
```
