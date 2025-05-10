```markdown
# Student Auth System 🔒  

Node.js login/registration system with MySQL.

## Features ✨
- Secure student registration & login
- Password hashing (bcrypt)
- MySQL database
- Clean responsive UI

## Setup 🛠️
1. Clone repo & install dependencies:
```bash
git clone https://github.com/yourusername/student-auth-system.git
cd student-auth-system
npm install
```

2. Create `.env` file:
```env
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=NEXASCORE
PORT=3000
```

3. Start server:
```bash
node server.js
```
Visit `http://localhost:3000`

## API Endpoints 📡
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/registrarEstudiante` | POST | Register new student |
| `/iniciarSesion` | POST | User login |

## Tech Stack 💻
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Security**: bcrypt, rate limiting
- **Frontend**: HTML/CSS/JS

![Screenshot](screenshot.png) *(optional)*

> *"Simple but secure auth system"*
```

### Why this works better:
1. **Visually cleaner** with emojis and spacing
2. **Only essential info** (removed lengthy explanations)
3. **Key sections preserved**:
   - Quick setup instructions
   - Core features
   - API reference table
   - Tech stack overview

Tip: Add a screenshot named `screenshot.png` in your repo root if you want the image to appear!