# 🚀 IESIS Portal - Quick Start Guide

## ⚡ 30-Second Setup

```powershell
# 1. Navigate to project
cd "c:\Users\user\OneDrive\Desktop\PROJ_5"

# 2. Install dependencies (if not done)
npm install

# 3. Start server
npm start

# 4. Open browser
http://localhost:3000

# 5. Login with
Username: admin
Password: admin123
```

---

## 📋 What You Have Now

✅ **Full-Stack Web App**
- Express.js backend on Node.js
- SQLite database with users table
- Secure password storage with bcrypt

✅ **Authentication System**
- Login/Logout functionality
- Session management with 24-hour timeout
- JWT tokens for additional security
- "Remember me" checkbox on login

✅ **Protected Pages** (require login)
- `/home` - Main dashboard
- `/nsrp.html` - NSRP Staff Dashboard
- `/peso-services.html` - PESO Services
- `/labor-market.html` - Labor Market Info
- `/cdsp-programs.html` - CDSP Programs

✅ **Public Pages** (no login needed)
- `/login` - Login form

✅ **Database** (auto-created)
- `auth.db` - SQLite database with 2 tables
- users table - User accounts
- sessions table - Active sessions

---

## 🎯 File Structure

```
Your Project Folder
├── server.js              ← Main server (starts here)
├── package.json           ← Dependencies list
├── .env                   ← Configuration
├── auth.db               ← Database (auto-created)
├── public/               ← Served files
│   ├── login.html        ← Login page
│   ├── home.html         ← Dashboard
│   ├── nsrp.html         ← NSRP page
│   ├── peso-services.html
│   ├── labor-market.html
│   ├── cdsp-programs.html
│   ├── 404.html
│   ├── assets/           ← CSS & JavaScript
│   └── images/           ← Images & media
├── SETUP.md              ← Full setup guide
└── ARCHITECTURE.md       ← Technical docs
```

---

## 🔑 Key Files Explained

### server.js
**What it does**: Runs your web application
- Creates Express server on port 3000
- Sets up authentication middleware
- Defines all routes (pages + API endpoints)
- Manages database connections

**Key functions**:
```javascript
requireAuth     // Middleware to protect pages
/api/login      // Login API endpoint
/api/logout     // Logout API endpoint
/api/user       // Get current user info
```

### public/login.html
**What it does**: Shows login form to users
- Form with username & password fields
- Sends credentials to `/api/login`
- Shows demo credentials (admin / admin123)
- Handles success/error messages
- Redirects to `/home` after login

### public/home.html
**What it does**: Shows welcome dashboard after login
- Displays user name and role in top bar
- Links to all protected pages
- Shows portal features
- Logout button

---

## 🔐 How Authentication Works

1. **User visits site** → Checks if logged in
2. **Not logged in?** → Redirected to `/login`
3. **Enters credentials** → Sends to server
4. **Server validates** → Checks database for user
5. **Password matches** → Creates session, generates JWT
6. **User is logged in** → Cookie is set, redirected to `/home`
7. **Access any page** → Session cookie proves user is logged in
8. **Click logout** → Session is destroyed, redirected to login

---

## 🛠️ Common Tasks

### ✅ Start the Server
```powershell
npm start
```
Server runs on: `http://localhost:3000`

### ✅ Stop the Server
Press `Ctrl + C` in the terminal

### ✅ View Database
- Install SQLite browser (DBeaver, SQLiteStudio, or VSCode extension)
- Open file: `auth.db`
- View `users` table to see accounts

### ✅ Add New User
Via database (advanced):
```sql
INSERT INTO users (username, email, password, full_name, role)
VALUES ('john', 'john@iesis.local', '[bcrypt_hash]', 'John Doe', 'user');
```

### ✅ Reset Admin Password
- Delete `auth.db` file
- Restart server
- Logs in with default: admin / admin123

### ✅ Add New Protected Page
1. Create new HTML file in `public/` folder
2. Add route to `server.js`:
```javascript
app.get('/mypage.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mypage.html'));
});
```

---

## 🧪 Testing Checklist

- [ ] Can access http://localhost:3000 in browser
- [ ] Login page loads
- [ ] Can login with admin / admin123
- [ ] Dashboard shows after login
- [ ] Logout button works
- [ ] Cannot access /nsrp.html without logging in
- [ ] Can access /nsrp.html after login
- [ ] Page refresh keeps user logged in
- [ ] All 4 service cards on dashboard are clickable

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| Server won't start | Check if port 3000 is in use. Try `npm start` again |
| Login doesn't work | Verify username=admin, password=admin123 exactly |
| Pages are 404 errors | Restart server, check files in `public/` folder |
| Styles/images missing | Run: `python -c "import shutil; shutil.copytree('assets', 'public/assets', dirs_exist_ok=True)"` |
| Stuck on login forever | Check browser console (F12) for errors, restart server |
| Database errors | Delete `auth.db`, restart server (recreates it) |

---

## 📊 Architecture at a Glance

```
User Browser
    ↓
HTML Pages + Forms (public/)
    ↓ (HTTP requests)
Express Server (server.js)
    ├→ Check authentication
    ├→ Validate passwords
    ├→ Create sessions
    └→ Serve pages/data
    ↓
SQLite Database (auth.db)
    └→ Store users & sessions
```

---

## 🎓 Learning Path

1. **First**: Get familiar with `server.js` - understand the flow
2. **Next**: Modify login.html - change colors, add fields
3. **Then**: Add new routes in server.js
4. **Finally**: Deploy to production (follow ARCHITECTURE.md)

---

## 📱 Browser Developer Tools

Open with **F12** or **Right-click → Inspect**:

| Tab | Purpose |
|-----|---------|
| **Console** | See error messages |
| **Network** | View HTTP requests to `/api/login` |
| **Application → Cookies** | See session cookie |
| **Application → Local Storage** | See JWT token (if saved) |

---

## 🔗 Important Links

- **Local App**: http://localhost:3000
- **Login Page**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/home
- **API Base**: http://localhost:3000/api

---

## 💡 Pro Tips

1. **Postman Testing**: Import these requests to test API:
   - POST `http://localhost:3000/api/login` with `{"username":"admin","password":"admin123"}`
   - GET `http://localhost:3000/api/user` (with session)
   - POST `http://localhost:3000/api/logout`

2. **Database Inspection**:
   ```javascript
   // Open Node REPL
   const sqlite3 = require('sqlite3');
   const db = new sqlite3.Database('./auth.db');
   db.all('SELECT * FROM users', (err, rows) => console.log(rows));
   ```

3. **Enable Auto-Reload**:
   - Install nodemon: `npm install -D nodemon`
   - Start with: `nodemon server.js`
   - Changes to code auto-reload server

4. **View Logs**:
   - Terminal output shows all events
   - Check `Database: ./auth.db` confirmation
   - Server startup shows default credentials

---

## 📞 Help & Support

- **Issues**: Check browser console (F12) for error messages
- **Database**: Review `auth.db` with SQLite browser
- **Logs**: Read terminal output for server messages
- **Docs**: See SETUP.md and ARCHITECTURE.md for details

---

## ✨ You're Ready!

Your IESIS Portal is running locally with:
- ✅ User authentication
- ✅ Secure password storage
- ✅ Protected pages
- ✅ Modern UI
- ✅ Local database

**Start server**: `npm start`
**Login**: admin / admin123
**Access**: http://localhost:3000

Happy coding! 🚀
