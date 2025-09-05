# CareSync 🏥

**A comprehensive healthcare management platform that streamlines facility management, provider networks, and patient referrals.**

[![Azure Static Web Apps CI/CD](https://github.com/unknown11-svg/CareSync/actions/workflows/azure-static-web-apps-happy-meadow-0fa27781e.yml/badge.svg)](https://github.com/unknown11-svg/CareSync/actions/workflows/azure-static-web-apps-happy-meadow-0fa27781e.yml)
[![Node.js Backend Deploy](https://github.com/unknown11-svg/CareSync/actions/workflows/musa_caresync.yml/badge.svg)](https://github.com/unknown11-svg/CareSync/actions/workflows/musa_caresync.yml)

## 🌟 Live Demo

- **Frontend**: [https://happy-meadow-0fa27781e.1.azurestaticapps.net](https://happy-meadow-0fa27781e.1.azurestaticapps.net)
- **Backend API**: [https://caresync-gdevh3eccggqhjch.southafricanorth-01.azurewebsites.net](https://caresync-gdevh3eccggqhjch.southafricanorth-01.azurewebsites.net)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

CareSync revolutionizes healthcare management by providing a unified platform for:

- **Healthcare Facilities**: Centralized management of medical facilities with location-based services
- **Provider Networks**: Comprehensive provider management with specialization tracking
- **Patient Referrals**: Streamlined referral system with real-time availability
- **Event Management**: Integrated system for medical conferences and training events

## ✨ Features

### 🏥 Facility Management
- Interactive facility dashboard with map integration
- Department-wise service categorization
- Real-time location tracking with Leaflet maps
- Comprehensive facility profiles with contact information

### 👨‍⚕️ Provider Portal
- Multi-role authentication (Admin, Facility Admin, Provider)
- Provider profile management with specializations
- Slot management and availability tracking
- Performance analytics and reporting

### 📊 Administrative Features
- Centralized admin control panel
- Real-time facility and provider analytics
- RSVP and event management system
- Advanced filtering and search capabilities

### 🗺️ Location Intelligence
- Interactive maps powered by OpenStreetMap
- Geographic proximity-based facility discovery
- Click-to-select location functionality
- Custom location pin markers

### 🔐 Security & Authentication
- JWT-based authentication system
- Role-based access control
- Secure API endpoints
- Environment-based configuration

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Bootstrap
- **Maps**: Leaflet with React-Leaflet
- **Icons**: React Icons (Feather Icons)
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Environment Management**: dotenv

### DevOps & Deployment
- **Frontend Hosting**: Azure Static Web Apps
- **Backend Hosting**: Azure App Service
- **CI/CD**: GitHub Actions
- **Version Control**: Git & GitHub

## 📁 Project Structure

```
CareSync/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── Dropdown.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── MapPicker.jsx  # Interactive map component
│   │   │   ├── PatientLayout.jsx
│   │   │   ├── ProviderLayout.jsx
│   │   │   └── SlotPicker.jsx
│   │   ├── contexts/          # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Application pages/routes
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Facilities.jsx
│   │   │   ├── FacilitiesAdminTab.jsx
│   │   │   ├── FacilityAnalytics.jsx
│   │   │   ├── FacilityDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── provider/      # Provider-specific pages
│   │   ├── services/          # API service layer
│   │   │   └── api.js
│   │   └── utils/             # Utility functions
│   ├── public/               # Static assets
│   └── package.json
├── backend/                   # Node.js backend application
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── adminController.js
│   │   │   ├── facilityAdminController.js
│   │   │   ├── patientController.js
│   │   │   ├── providerController.js
│   │   │   ├── referralController.js
│   │   │   └── specialityC.js
│   │   ├── middleware/       # Express middleware
│   │   │   └── authMiddleware.js
│   │   ├── models/          # MongoDB data models
│   │   │   ├── admin.js
│   │   │   ├── facilities.js
│   │   │   ├── patients.js
│   │   │   ├── provider.js
│   │   │   ├── referral.js
│   │   │   └── Speciality.js
│   │   ├── routes/          # API route definitions
│   │   │   ├── adminRoutes.js
│   │   │   ├── facilityAdminRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   ├── providerRoutes.js
│   │   │   └── SpecialityR.js
│   │   └── server.js        # Application entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── .github/
│   └── workflows/           # GitHub Actions workflows
│       ├── azure-static-web-apps.yml
│       └── musa_caresync.yml
├── README.md
├── TODO.md
└── LICENSE

```

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB database
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/unknown11-svg/CareSync.git
   cd CareSync
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with your configuration
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   
   # Start the backend server
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Environment Variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

## 🔧 Usage

### User Roles & Access

**Admin**
- Full system access
- Manage facilities and providers
- View analytics and reports
- Event management

**Facility Admin**
- Manage specific facility
- Add/edit services and departments
- Manage facility providers
- View facility-specific analytics

**Provider**
- Manage personal profile
- Set availability slots
- View referrals and appointments
- Access provider analytics

### Key Workflows

1. **Adding a New Facility**
   - Navigate to Facilities Management
   - Click "Add New Facility"
   - Fill in facility details including location
   - Use the interactive map to set precise coordinates
   - Save and verify on the facility list

2. **Managing Provider Availability**
   - Access Provider Dashboard
   - Navigate to Slots Management
   - Set available time slots
   - Update specializations and services

3. **Processing Referrals**
   - View incoming referrals in dashboard
   - Accept or decline based on availability
   - Update referral status and notes

## 📚 API Documentation

### Base URLs
- **Development**: `http://localhost:5000/api`
- **Production**: `https://caresync-gdevh3eccggqhjch.southafricanorth-01.azurewebsites.net/api`

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
```
POST /admin/login          # Admin login
POST /provider/login       # Provider login
POST /facilityAdmin/login  # Facility admin login
```

#### Facilities (Specialities)
```
GET    /specialities       # Get all facilities
POST   /specialities       # Create new facility
PUT    /specialities/:id   # Update facility
DELETE /specialities/:id   # Delete facility
GET    /specialities/:id   # Get facility by ID
```

#### Providers
```
GET    /providers          # Get all providers
POST   /providers          # Create new provider
PUT    /providers/:id      # Update provider
DELETE /providers/:id      # Delete provider
```

#### Referrals
```
GET    /referrals          # Get all referrals
POST   /referrals          # Create new referral
PUT    /referrals/:id      # Update referral status
```

### Sample API Usage

**Create a new facility:**
```javascript
const facilityData = {
  name: "City Medical Center",
  description: "Full-service medical facility",
  department: "General Medicine",
  services: ["Emergency Care", "Surgery", "Diagnostics"],
  referralContact: "referrals@citymedical.com",
  notes: "24/7 emergency services available",
  location: {
    type: "Point",
    coordinates: [-122.4194, 37.7749],
    name: "San Francisco, CA"
  }
};

const response = await fetch('/api/specialities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(facilityData)
});
```

## 🚀 Deployment

The application is deployed using Azure services with automated CI/CD pipelines.

### Frontend Deployment (Azure Static Web Apps)
- **URL**: https://happy-meadow-0fa27781e.1.azurestaticapps.net
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Deployment**: Automatic on push to `Musa` branch

### Backend Deployment (Azure App Service)
- **URL**: https://caresync-gdevh3eccggqhjch.southafricanorth-01.azurewebsites.net
- **Runtime**: Node.js
- **Deployment**: Automatic via GitHub Actions

### Environment Variables (Production)
Set these in Azure App Service Configuration:
```
MONGODB_URI=<your_production_mongodb_uri>
JWT_SECRET=<your_production_jwt_secret>
NODE_ENV=production
FRONTEND_URL=https://happy-meadow-0fa27781e.1.azurestaticapps.net
PORT=80
```

### Manual Deployment

If you need to deploy manually:

1. **Frontend (Static Web Apps)**
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder to Azure Static Web Apps
   ```

2. **Backend (App Service)**
   ```bash
   cd backend
   # Deploy entire backend folder to Azure App Service
   ```

## 🤝 Contributing

We welcome contributions to CareSync! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write/update tests**
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Write clear, descriptive commit messages
- Update documentation as needed
- Test your changes thoroughly
- Ensure responsive design principles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for providing free map data
- **Leaflet** for the interactive mapping library
- **Azure** for hosting and deployment services
- **MongoDB** for database services
- **React** and **Node.js** communities for excellent documentation

## 📞 Support

For support create an issue in the GitHub repository.

---

**Built with ❤️ for better healthcare management** Admin System