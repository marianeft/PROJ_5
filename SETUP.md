# IESIS Portal - Local Development Server

Complete full-stack web application with authentication, protected routes, and all pages running entirely on localhost.

## 📋 Features

✅ **Pure Local Architecture**: No external CMS dependencies (no WordPress, Google Sites, or third-party platforms)
✅ **JWT & Session Authentication**: Secure user authentication with session management
✅ **Protected Route Middleware**: All pages require authentication before access
✅ **SQLite Database**: Built-in user database with authentication
✅ **Clean Code Structure**: Organized folders and modular Express server
✅ **Responsive UI**: Mobile-friendly login and dashboard pages
✅ **Easy Development**: Hot-reload support with nodemon

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 14+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- Windows PowerShell or Command Prompt

### Installation & Setup

#### 1️⃣ **Install Dependencies**
```powershell
npm install
```

#### 2️⃣ **Run Setup Script** (copies assets and files)
```powershell
.\setup.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3️⃣ **Start the Development Server**
```powershell
npm start
```

You should see:
```
╔════════════════════════════════════════════════╗
║   IESIS Portal - Local Development Server      ║
╚════════════════════════════════════════════════╝

✓ Server running at: http://localhost:3000
✓ Database: ./auth.db
```

#### 4️⃣ **Open in Browser**
```
http://localhost:3000
```

---

## 🔐 Authentication

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials in production!

### Protected Pages
All pages require authentication to access:
- `/home` - Dashboard
- `/nsrp.html` - NSRP Staff Dashboard
- `/peso-services.html` - PESO Services
- `/labor-market.html` - Labor Market Info
- `/cdsp-programs.html` - CDSP Programs

### Public Pages
- `/login` - Login page
- `/` - Redirects to login or home based on auth status

---

## 📁 Project Structure

```
PROJ_5/
├── server.js                 # Main Express server with auth middleware
├── package.json              # Project dependencies
├── .env                       # Environment variables
├── auth.db                    # SQLite database (auto-created)
├── setup.ps1                  # Setup script
├── README.md                  # This file
│
├── public/                    # Static files served by Express
│   ├── login.html            # Login page
│   ├── home.html             # Dashboard homepage
│   ├── nsrp.html             # NSRP Staff Dashboard
│   ├── peso-services.html    # PESO Services
│   ├── labor-market.html     # Labor Market Info
│   ├── cdsp-programs.html    # CDSP Programs
│   ├── 404.html              # 404 error page
│   ├── assets/               # CSS and JavaScript
│   │   ├── css/
│   │   └── js/
│   └── images/               # Images and media
│
├── assets/                    # (Source) Original assets
│   ├── css/
│   └── js/
└── images/                    # (Source) Original images
```

---

## 🔒 How Authentication Works

### Flow Diagram
```
User Request
    ↓
Is user logged in? (session.userId exists)
    ↓
    ├→ YES: Serve requested page
    │
    └→ NO: Redirect to /login
        ↓
    User enters credentials
        ↓
    POST /api/login with username/password
        ↓
    Validate with bcrypt (hashed passwords)
        ↓
    Success: Create session & JWT token
        ↓
    Redirect to home or requested page
```

### Session Management
- Sessions stored in memory (for development)
- Session timeout: 24 hours
- HttpOnly cookies (secure by default)
- JWT tokens for additional security

---

## 🛠️ Development

### Available Commands

**Start Production Server:**
```powershell
npm start
```

**Start with Auto-Reload (requires nodemon):**
```powershell
npm run dev
```

### Environment Variables

Edit `.env` file:
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production-12345
```

### Database Management

The SQLite database is auto-created at `./auth.db` with:
- **users** table: User accounts and credentials
- **sessions** table: Active session tracking

To reset the database, delete `auth.db` and restart the server.

---

## 📝 API Endpoints

### Authentication

**POST `/api/login`**
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrator",
    "email": "admin@iesis.local",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**POST `/api/logout`**
```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

**GET `/api/user`**
```json
Response (if authenticated):
{
  "id": 1,
  "username": "admin",
  "email": "admin@iesis.local",
  "full_name": "Administrator",
  "role": "admin"
}

Response (if not authenticated):
{
  "error": "Not authenticated"
}
```

---

## 🔄 Middleware Stack

1. **Express.json** - Parse JSON payloads
2. **Express.urlencoded** - Parse URL-encoded form data
3. **Express.static** - Serve static files from `public/`
4. **express-session** - Session management with cookies
5. **Custom Auth Middleware** - Check session on protected routes

---

## 🌐 Browser Testing

### Test Different Scenarios

1. **First Visit (Not Logged In)**
   - URL: `http://localhost:3000`
   - Expected: Redirect to `/login`

2. **Login Successfully**
   - Enter: `admin` / `admin123`
   - Expected: Redirect to `/home` dashboard

3. **Access Protected Page**
   - URL: `http://localhost:3000/nsrp.html`
   - Without login: Redirect to `/login?return=%2Fnsrp.html`
   - With login: Show NSRP dashboard

4. **Logout**
   - Click "Logout" button
   - Expected: Session destroyed, redirect to login

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Change port in .env
PORT=3001
```

### Dependencies Won't Install
```powershell
# Clear npm cache and reinstall
npm cache clean --force
npm install
```

### "Cannot find module" Errors
```powershell
# Reinstall node_modules
Remove-Item node_modules -Recurse
npm install
```

### Database Locked Error
```powershell
# Delete database and restart (creates new one)
Remove-Item auth.db
npm start
```

### Session Not Persisting
- Check browser cookies are enabled
- Ensure same port and domain accessed consistently
- Clear browser cache and try again

---

## 🔐 Security Notes

### For Development Only ⚠️
- Default admin credentials are exposed in code
- JWT_SECRET is visible in `.env`
- Sessions stored in memory (not persistent)
- HTTPS not enabled

### For Production 🔒
1. Change all default passwords
2. Use strong JWT_SECRET (generate with: `openssl rand -base64 32`)
3. Enable HTTPS with SSL certificates
4. Use production session store (Redis, PostgreSQL)
5. Add rate limiting and CSRF protection
6. Implement password hashing with bcrypt (already done)
7. Use environment-specific .env files
8. Enable secure cookies (`secure: true`)
9. Add CORS restrictions
10. Implement user roles and permissions

---

## 📚 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 14+ |
| Server | Express.js | 4.18+ |
| Database | SQLite3 | 5.1+ |
| Authentication | JWT + Sessions | - |
| Password Hashing | bcryptjs | 2.4+ |
| Session Store | express-session | 1.17+ |

---

## 🚀 Deployment

To deploy to production:

1. **Set environment variables** on your hosting platform
2. **Use production database** (PostgreSQL, MySQL, etc.)
3. **Enable HTTPS** with SSL certificates
4. **Set secure cookie flags**: `secure: true`, `sameSite: 'strict'`
5. **Use environment-specific configuration**
6. **Implement monitoring and logging**
7. **Add backup and recovery procedures**

Example production server.js changes:
```javascript
// Use environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

app.use(session({
  // ... config
  cookie: {
    secure: isProduction,        // HTTPS only in production
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
```

---

## 📞 Support

### Common Issues & Solutions

- **Pages show "Cannot GET"**: Ensure server is running (`npm start`)
- **Login fails**: Check auth.db exists, verify admin credentials
- **Styles not loading**: Ensure assets folder was copied to public/
- **Session timeout**: Increase maxAge in session config

---

## 📄 License

This project is part of the IESIS (Integrated Employment and Skills Information System) Portal.

---

## ✨ Summary

Your IESIS Portal is now a complete local web application:
- ✅ All pages run on `localhost:3000`
- ✅ User authentication with login page
- ✅ Protected routes that require authentication
- ✅ Clean database-backed auth system
- ✅ No external dependencies or hosted CMS
- ✅ Ready for development and testing

**Next Step**: Run `npm start` and visit `http://localhost:3000`!
