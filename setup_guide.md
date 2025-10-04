# Quick Setup Guide

## 1. MySQL Database Setup

First, make sure MySQL is installed and running on your system.

### Windows:
- Install MySQL from https://dev.mysql.com/downloads/mysql/
- Or use XAMPP which includes MySQL

### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt install mysql-server

# macOS with Homebrew
brew install mysql
```

### Create Database User (Optional):
```sql
CREATE USER 'feedback_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON feedback_system.* TO 'feedback_user'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python run.py
```

The backend will start on http://localhost:8000

## 3. Frontend Setup

```bash
# Navigate to frontend directory  
cd frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm run dev
```

The frontend will start on http://localhost:3000

## 4. Usage

1. Open http://localhost:3000 in your browser
2. Allow camera access when prompted
3. Use thumbs up gesture for positive feedback
4. Use thumbs down gesture to open the feedback form
5. The form auto-closes after 20 seconds
6. View all feedback in the dashboard table

## Troubleshooting

### Camera Issues:
- Make sure you're using HTTPS or localhost
- Check browser camera permissions
- Ensure good lighting conditions

### Database Issues:
- Verify MySQL is running
- Check database credentials in backend/config.py
- Make sure the database exists

### CORS Issues:
- Both frontend and backend must be running
- Check that ports 3000 and 8000 are available

## Environment Variables (Optional)

You can create a `.env` file in the backend directory:

```
DB_HOST=localhost
DB_NAME=feedback_system  
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
```
