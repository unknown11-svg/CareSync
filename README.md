# CareSync Admin System

A comprehensive healthcare coordination platform that enables facility onboarding and provider management for the ClinicBridge project.

## 🚀 Features

### Admin Dashboard
- **Facility Management**: Onboard and manage healthcare facilities
- **Provider Accounts**: Create and manage healthcare staff accounts
- **System Statistics**: Real-time overview of system usage
- **Role-based Access**: Secure authentication and authorization

### Core Functionality
- **Facility Onboarding**: Add hospitals, clinics, and mobile units with geospatial data
- **Provider Management**: Create accounts for doctors, nurses, and coordinators
- **Permission System**: Granular access control for different roles
- **Dashboard Analytics**: System-wide statistics and monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security headers

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hot Toast** for notifications

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd CareSync
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/caresync
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Database Setup

Start MongoDB and run the seed script:

```bash
cd backend
npm run seed
```

This creates an initial admin user:
- **Email**: admin@caresync.com
- **Password**: admin123

### 5. Start the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📊 API Endpoints

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Admin authentication |
| GET | `/dashboard/stats` | Dashboard statistics |
| POST | `/facilities` | Create new facility |
| GET | `/facilities` | Get all facilities |
| POST | `/providers` | Create provider account |
| GET | `/providers` | Get all providers |
| PUT | `/providers/:id` | Update provider |
| DELETE | `/providers/:id` | Deactivate provider |

## 🏗️ Project Structure

```
CareSync/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── models/
│   │   │   ├── admin.js
│   │   │   ├── provider.js
│   │   │   ├── facilities.js
│   │   │   ├── patients.js
│   │   │   ├── events.js
│   │   │   └── referral.js
│   │   ├── routes/
│   │   │   └── adminRoutes.js
│   │   ├── scripts/
│   │   │   └── seedAdmin.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Facilities.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Providers.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🔐 Authentication

The system uses JWT-based authentication with the following flow:

1. **Login**: Admin provides email/password
2. **Token Generation**: Server validates credentials and returns JWT
3. **Protected Routes**: Frontend includes token in Authorization header
4. **Middleware**: Backend validates token on protected endpoints

## 🎯 User Roles

### Admin
- **Super Admin**: Full system access
- **Admin**: Standard administrative privileges

### Provider
- **Doctor**: Medical staff with referral permissions
- **Nurse**: Clinical staff with limited permissions
- **Coordinator**: Administrative staff for facility management

## 🔧 Development

### Adding New Features

1. **Backend**: Add models, controllers, and routes
2. **Frontend**: Create components and pages
3. **Testing**: Update API endpoints and UI components

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/caresync` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build and deploy to your preferred platform
3. Ensure MongoDB is accessible

### Frontend Deployment
1. Update API base URL in production
2. Build with `npm run build`
3. Deploy to static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is part of the ClinicBridge healthcare coordination platform.

## 🆘 Support

For support and questions, please refer to the project documentation or create an issue in the repository.