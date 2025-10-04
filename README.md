# Feedback Management System

A full-stack web application that uses gesture recognition to collect feedback. Users can show thumbs up for positive feedback or thumbs down to open a feedback form.

## Features

- **Real-time Camera Feed**: Live video capture using WebRTC
- **Gesture Recognition**: Uses MediaPipe to detect thumbs up/down gestures
- **Instant Positive Feedback**: Thumbs up sends positive feedback directly to backend
- **Negative Feedback Form**: Thumbs down opens a popup form with auto-close timer (20 seconds)
- **Feedback Dashboard**: View all collected feedback entries in a clean table
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + MediaPipe
- **Backend**: Python FastAPI
- **Database**: MySQL
- **Gesture Detection**: MediaPipe Hands

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL server

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your MySQL database by updating the database configuration in `config.py` or setting environment variables:
   - `DB_HOST`: MySQL host (default: localhost)
   - `DB_NAME`: Database name (default: feedback_system)
   - `DB_USER`: MySQL username (default: root)
   - `DB_PASSWORD`: MySQL password
   - `DB_PORT`: MySQL port (default: 3306)

4. Start the backend server:
```bash
python run.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

- `POST /feedback` - Create a new feedback entry
- `GET /feedbacks` - Retrieve all feedback entries

## Usage

1. Open the application in your browser
2. Grant camera permissions when prompted
3. Show thumbs up gesture for positive feedback
4. Show thumbs down gesture to open the negative feedback form
5. Fill out the form within 20 seconds or it will auto-close
6. View all feedback entries in the dashboard table

## Database Schema

```sql
CREATE TABLE feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
feedback/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Troubleshooting

- **Camera not working**: Ensure camera permissions are granted in your browser
- **Database connection issues**: Check that MySQL is running and credentials are correct
- **CORS errors**: Make sure both frontend (3000) and backend (8000) are running
- **Gesture detection not working**: Ensure good lighting conditions and hand visibility
