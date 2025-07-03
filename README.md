# 🧢 PrintPeak – Custom Clothes Printing E-Commerce Platform

**PrintPeak** is a full-stack dynamic e-commerce web application for a **custom clothes printing business**. It allows users to browse apparel, upload custom designs, preview them on mockups, and place orders. Admins can manage products, view orders, and update statuses.

Built using the **MERN stack**, it features **Cloudinary** for image uploads, **Stripe** for payments, and is deployed on **Vercel + Render**.

---

## 🚀 Live Demo

- **Frontend (Vercel)**: _[Coming Soon]_  
- **Backend (Render)**: _[Coming Soon]_  

---

## 📌 Features

### 👤 User Panel

- 🔐 JWT Authentication (Register / Login)
- 🛍️ Browse products with variants (size, color, type)
- 🖼️ Upload designs with Cloudinary
- 👕 Preview custom mockups
- 🛒 Add to cart & checkout
- 💳 Pay securely with Stripe
- 📦 Track orders & view history
- 👤 Manage personal profile

### 🛠️ Admin Panel

- 📊 Dashboard access
  - ➕ Add / ✏️ Edit / 🗑️ Delete products
  - 📋 View all user orders
  - 🔄 Update order statuses

---

## 🛠 Tech Stack

### ⚙️ Frontend

- React.js  
- TailwindCSS  
- React Router DOM  

### 🔧 Backend

- Node.js + Express.js  
- MongoDB Atlas  
- JWT for Auth  
- Stripe API for payments  
- Cloudinary for file uploads  

---

## 📁 Folder Structure

```

print-peak/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.js
│       └── ...
├── server/               # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── app.js
├── .env
└── README.md

````

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mrsumanth19/print-peak.git
cd print-peak
````

### 2. Setup Backend (Express)

```bash
cd server
npm install
# Create .env file using template below
npm start
```

### 3. Setup Frontend (React)

```bash
cd ../client
npm install
npm run dev
```

---

## 🔐 Environment Variables

> ⚠️ The `.env` file is **excluded** from the repository for security reasons.

Create a `.env` file in the `server/` directory with the following format:

```env
PORT=5000
MONGO_URI=mongodb+srv://yourMongoUser:yourMongoPassword@yourCluster.mongodb.net/printpeak?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=yourCloudName
CLOUDINARY_API_KEY=yourCloudinaryAPIKey
CLOUDINARY_API_SECRET=yourCloudinaryAPISecret
STRIPE_SECRET_KEY=yourStripeSecretKey
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=yourJWTSecretKey
```

You can also create a shared `server/.env.example` file for reference and add `.env` to your `.gitignore`.

---

## 🌐 Deployment

* **Frontend**: [Vercel](https://vercel.com/)
* **Backend**: [Render](https://render.com/)
* **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 📅 Development Roadmap

### Week 1

* Setup frontend/backend boilerplate
* JWT authentication system
* Product model with variants

### Week 2

* Product listing & detail pages
* Cloudinary upload & preview
* Cart & Checkout system

### Week 3

* Stripe payment integration
* Admin dashboard (product/order/status)

### Week 4

* Order tracking, user profile, order history
* Final testing & deployment

---

## 👥 Contributors

* [@mrsumanth19](https://github.com/mrsumanth19) – Creator
* [@mahe0420](https://github.com/mahe0420) – Contributor

---

## 📄 License

MIT © [Sumanth M](https://github.com/mrsumanth19)


