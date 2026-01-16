# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Backend Setup (2 minutes)

```bash
# Terminal 1 - Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

**Output should show:**
```
MongoDB connected successfully
Server running on port 5000
```

### Step 2: Frontend Setup (2 minutes)

```bash
# Terminal 2 - Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start React
npm start
```

**Browser will automatically open to:**
```
http://localhost:3000
```

### Step 3: First Test (1 minute)

1. **Register a Student:**
   - Click "Register Student"
   - Fill in:
     - Name: John Doe
     - Student ID: STU001
     - Class: 10
     - Division: A
     - Gender: Male
   - Click "Register Student"
   - QR code will appear!

2. **Mark Attendance:**
   - Click "Mark Attendance"
   - Scan the QR code (point camera at it)
   - Click "Start Scan" for fingerprint
   - Click "Capture Photo"
   - Click "Submit Attendance"

3. **View Dashboard:**
   - Click "Dashboard"
   - See attendance statistics

## 📋 System Requirements

- Node.js v14+
- MongoDB running
- Modern web browser with camera access
- 1GB RAM minimum
- 500MB disk space

## 🔧 Environment Setup

### Make sure MongoDB is running:

**Windows:**
```bash
# If installed via MSI
mongod

# Or start MongoDB service via Services
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

## ⚙️ Configuration Files

### Backend `.env` (already created)
```
MONGODB_URI=mongodb://localhost:27017/attendance_system
PORT=5000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

### Frontend automatic config
- Proxy to http://localhost:5000 (set in package.json)
- Auto-detects API endpoint

## 📱 Features Quick Reference

| Feature | Where | How |
|---------|-------|-----|
| Register Student | Home → Register Student | Fill form, get QR code |
| Mark Attendance | Home → Mark Attendance | Scan QR → Fingerprint → Photo |
| View Records | Home → Dashboard | See all attendance data |
| Download QR | Registration page | Click "Download QR Code" |
| Filter Attendance | Dashboard → Filters | By class, division, date |

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can register a student
- [ ] QR code displays on registration
- [ ] Dashboard shows no errors
- [ ] Can navigate all pages

## 🆘 Common Issues & Fixes

### Issue: `Cannot GET /api/students/all`
**Fix:** Backend not running. Run `npm run dev` in backend folder.

### Issue: Backend connection error
**Fix:** Check MongoDB is running. Try `mongod` in new terminal.

### Issue: Camera not working
**Fix:** 
- Grant browser camera permission
- Use HTTPS in production
- Check browser console for errors

### Issue: QR code won't scan
**Fix:**
- Ensure good lighting
- Hold QR code 6-12 inches from camera
- Make sure camera is focused

## 📊 Default Test Data

Use these values for testing:

**Student 1:**
- Name: Alice Johnson
- Student ID: STU001
- Class: 10
- Division: A
- Gender: Female

**Student 2:**
- Name: Bob Smith
- Student ID: STU002
- Class: 11
- Division: B
- Gender: Male

## 🎯 Next Steps

1. **Register multiple students** for testing
2. **Mark attendance** for each student
3. **Check dashboard** for statistics
4. **Try filtering** by class/division
5. **Download attendance** records

## 📞 Support

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed documentation
- Review error messages in browser console
- Ensure all ports (3000, 5000) are not in use

## ⚡ Performance Tips

- Clear browser cache if something looks off
- Use Chrome/Firefox for best compatibility
- Ensure good internet for initial npm installs
- Close unnecessary applications for smooth performance

---

**Ready to go?** Start with the three steps above! 🎓
