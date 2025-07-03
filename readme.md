# backend series learnt with javascript
- [Model link](https://app.eraser.io/...​)

# 🎥 MERN Stack Video Sharing Platform

A full-stack video sharing web application built with the MERN stack (MongoDB, Express, React, Node.js), providing features like user authentication, video upload, comments, likes, playlists, and more.

## ✨ Features

- 🔐 User Authentication (JWT-based)
- 📹 Upload & Watch Videos
- 💬 Comment on Videos
- ❤️ Like Videos, Comments & Tweets
- 📂 Create and Manage Playlists
- 📋 View Watch History
- 🧾 Profile with Avatar & Cover Upload
- 🔍 Search, Filter & Sort Videos
- 📱 Responsive UI (React + TailwindCSS)

---

## 🏗️ Tech Stack

| Category       | Technology                              |
|----------------|-----------------------------------------|
| Frontend       | React, React Router, Axios, TailwindCSS |
| Backend        | Node.js, Express.js                     |
| Database       | MongoDB + Mongoose                      |
| Auth           | JWT (Access & Refresh Tokens)           |
| File Upload    | Multer + Cloudinary                     |
| State Mgmt     | React Context / Redux (if used)         |
| Dev Tools      | Vite, Postman, Nodemon                  |

---

## 📁 Folder Structure (Backend)

backend/
├── controllers/
│ ├── user.controller.js
│ ├── video.controller.js
│ ├── comment.controller.js
│ └── playlist.controller.js
├── models/
│ ├── user.model.js
│ ├── video.model.js
│ ├── comment.model.js
│ ├── playlist.model.js
│ └── likecomment.model.js
├── routes/
│ ├── user.routes.js
│ ├── video.routes.js
│ ├── comment.routes.js
│ └── playlist.routes.js
├── middlewares/
│ ├── auth.middleware.js
│ ├── error.middleware.js
│ └── upload.middleware.js
├── utils/
│ ├── asynchandler.js
│ ├── apiresponse.js
│ └── apierror.js
├── config/
│ ├── db.js
│ └── cloudinary.js
├── .env
├── server.js
└── package.json

yaml
Copy code

---

## 🔧 Installation & Setup

### Prerequisites

- Node.js & npm
- MongoDB running locally or Atlas
- Cloudinary account (for image uploads)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mern-video-app.git
cd mern-video-app
2. Backend Setup
bash
Copy code
cd backend
npm install
Create a .env file in /backend:

env
Copy code
PORT=5000
MONGO_URI=your_mongo_uri
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
Start backend:

bash
Copy code
npm run dev
3. Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev
🧪 API Documentation
Available at:

🧾 Postman collection: Postman Link (or export file)

Key Routes:

Method	Route	Description
POST	/api/v1/auth/register	User Registration
POST	/api/v1/auth/login	Login & Token
GET	/api/v1/videos	Fetch All Videos
POST	/api/v1/videos/:id/comment	Add Comment
POST	/api/v1/playlist	Create Playlist
PATCH	/api/v1/playlist/:id	Update Playlist