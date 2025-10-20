# College Q&A Dashboard

A professional fullstack Q&A dashboard for colleges with role-based access control, built with React, Node.js, and MongoDB.

## ✨ Features

### 🎯 Core Functionality
- **Ask Questions**: Students can post questions with categories, tags, and priority levels
- **Answer Questions**: Community-driven answers with like/unlike functionality
- **Comments**: Threaded discussions on answers
- **Search & Filter**: Advanced filtering by category, status, priority, and tags
- **Real-time Updates**: Live updates for likes, comments, and new content

### 👥 User Management
- **Role-based Access**: Students, Teachers, and Admin roles with separate dashboards
- **Teacher Email Whitelist**: Only authorized teacher emails can access teacher portal
- **Google OAuth**: Secure authentication with Google accounts
- **Profile Management**: User profiles with department and student ID
- **Activity Tracking**: User engagement metrics and contribution history

### 🛡️ Admin Features
- **Dashboard Analytics**: Comprehensive statistics and insights
- **User Management**: Role assignment and account management
- **Content Moderation**: Question/answer management and archiving
- **System Monitoring**: Platform health and usage metrics

### 🎨 User Experience
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean, professional interface
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized loading and smooth interactions

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Cloud Console account (for OAuth)

### Automated Setup

**For Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```cmd
setup.bat
```

### Manual Setup

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   # Copy the example environment file
   cp api/env.example api/.env
   
   # Edit api/.env with your credentials
   nano api/.env
   ```

3. **Configure Google OAuth**:
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:5000/api/auth/google/callback` as redirect URI
   - Copy Client ID and Secret to `api/.env`

4. **Start MongoDB**:
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in api/.env
   ```

5. **Run the application**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
college-qa-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Layout.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── QuestionCard.js
│   │   │   └── AnswerCard.js
│   │   ├── pages/         # Dashboard pages
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── AskQuestion.js
│   │   │   ├── QuestionDetails.js
│   │   │   ├── Profile.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── NotFound.js
│   │   ├── context/       # React Context for state
│   │   │   └── AuthContext.js
│   │   ├── utils/         # Utility functions
│   │   │   ├── api.js
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── api/                   # Node.js backend
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── Answer.js
│   │   └── Comment.js
│   ├── routes/           # Express routes
│   │   ├── auth.js
│   │   ├── questions.js
│   │   ├── answers.js
│   │   └── admin.js
│   ├── middleware/        # Auth middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── config/           # Database config
│   │   └── passport.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── package.json          # Root package.json
├── setup.sh              # Linux/macOS setup script
├── setup.bat             # Windows setup script
└── README.md
```

## 🔧 Environment Variables

### API Environment (`api/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/college-qa
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Teacher email whitelist (comma-separated)
TEACHER_EMAILS=teacher1@college.edu,teacher2@college.edu,admin@college.edu
```

### Client Environment (`client/.env`)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🛠️ Available Scripts

### Root Level Scripts
- `npm run dev` - Run both frontend and backend concurrently
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run install-all` - Install all dependencies
- `npm run build` - Build frontend for production

### API Scripts (`cd api`)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Client Scripts (`cd client`)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔐 Authentication & Authorization

### Google OAuth Setup
1. Visit [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
7. Copy Client ID and Secret to your `.env` file

### Role-based Access Control
- **Students**: Can ask questions, answer questions, comment, like content
- **Teachers**: All student permissions + can access teacher dashboard, moderate content, view analytics
- **Admin**: Full system access + user management, analytics, content deletion

### Teacher Authentication
- **Separate Login Portal**: Teachers access via `/teacher-login` 
- **Email Whitelist**: Only emails listed in `TEACHER_EMAILS` environment variable can become teachers
- **Automatic Role Assignment**: Role is determined during OAuth based on email whitelist
- **Dedicated Dashboard**: Teachers get access to `/teacher-dashboard` with specialized tools

## 🗄️ Database Schema

### User Model
```javascript
{
  googleId: String,
  email: String (unique),
  name: String,
  avatar: String,
  role: String (student/teacher/admin),
  department: String,
  studentId: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Question Model
```javascript
{
  title: String,
  content: String,
  author: ObjectId (User),
  tags: [String],
  category: String,
  isResolved: Boolean,
  priority: String,
  views: Number,
  likes: [ObjectId (User)],
  isArchived: Boolean
}
```

### Answer Model
```javascript
{
  content: String,
  author: ObjectId (User),
  question: ObjectId (Question),
  isAccepted: Boolean,
  likes: [ObjectId (User)],
  isEdited: Boolean,
  editedAt: Date
}
```

### Comment Model
```javascript
{
  content: String,
  author: ObjectId (User),
  answer: ObjectId (Answer),
  parentComment: ObjectId (Comment),
  likes: [ObjectId (User)],
  isEdited: Boolean,
  editedAt: Date
}
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-qa
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret
JWT_SECRET=your_production_jwt_secret
PORT=5000
CLIENT_URL=https://yourdomain.com
```

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../api
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/college-qa-dashboard/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the flexible database
- Google for OAuth authentication
- All contributors and users of this project
