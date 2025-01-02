# Project Structure Documentation

## Backend Structure (Spring Boot)

### Configuration Files
- `pom.xml`: Maven dependencies and project configuration
- `application.properties`: Application configuration, database, JWT, etc.

### Source Code Structure (/src/main/java/com/example/demo)
```
├── config/
│   ├── ApplicationConfig.java        # Spring Boot configuration
│   ├── SecurityConfig.java          # Security and CORS configuration
│   └── WebConfig.java               # Web configuration
├── controller/
│   ├── AuthenticationController.java # Authentication endpoints
│   ├── FileController.java          # File management endpoints
│   ├── TestController.java          # Test endpoints
│   └── UserController.java          # User management endpoints
├── exception/
│   ├── DuplicateResourceException.java
│   ├── ErrorResponse.java
│   ├── FileNotFoundException.java
│   ├── FileStorageException.java
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── UnauthorizedAccessException.java
│   └── UserNotFoundException.java
├── model/
│   ├── entity/
│   │   ├── File.java                # File entity
│   │   └── User.java                # User entity
│   └── dto/
│       ├── AuthenticationRequest.java
│       ├── AuthenticationResponse.java
│       ├── FileDTO.java
│       ├── RegisterRequest.java
│       └── UserDTO.java
├── repository/
│   ├── FileRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── JwtService.java
└── service/
    ├── AuthenticationService.java
    ├── FileService.java
    ├── UserDetailsServiceImpl.java
    └── UserService.java
```

### Database Schema (PostgreSQL)
```sql
-- Schema: linkfile

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_ VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE files (
    file_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Structure (React)

### Project Organization
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx           # Login form component
│   │   └── RegisterForm.jsx        # Registration form component
│   ├── ui/
│   │   └── Alert.jsx              # Reusable alert component
│   └── ProtectedRoute.jsx         # Route protection wrapper
├── hooks/
│   └── useAuth.js                 # Authentication hook
├── layouts/
│   ├── AuthLayout.jsx             # Layout for auth pages
│   └── DashboardLayout.jsx        # Layout for dashboard
├── pages/
│   ├── LoginPage.jsx              # Login page
│   ├── RegisterPage.jsx           # Registration page
│   └── DashboardPage.jsx          # Dashboard page
├── services/
│   └── api.js                     # API service functions
├── utils/
│   └── jwt.js                     # JWT helper functions
└── App.jsx                        # Main application component
```

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "lucide-react": "^latest"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
  - Params: username, email, password
- POST `/api/auth/authenticate` - Login user
  - Params: username, password

### Files
- POST `/api/files/upload` - Upload file
  - Params: file, userId
- GET `/api/files/user/{userId}` - Get user files
- GET `/api/files/download/{fileId}` - Download file
- DELETE `/api/files/{fileId}` - Delete file

### Users
- GET `/api/users/{id}` - Get user details
- POST `/api/users` - Create user

### Test
- GET `/api/test/public` - Public endpoint
- GET `/api/test/secured` - Protected endpoint

## Security Implementation

### JWT Configuration
- Secret key defined in application.properties
- Token expiration: 24 hours
- Token contains: username, roles, expiration

### Protected Routes
- Frontend: ProtectedRoute component checks JWT validity
- Backend: JwtAuthenticationFilter validates tokens

### CORS Configuration
- Allowed origins: http://localhost:3000
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Authorization, Content-Type

## File Storage
- Base upload directory: ./uploads
- Maximum file size: 200MB
- Allowed file types: images, PDFs, documents, text files

## Development Setup

### Backend
1. PostgreSQL database setup
2. Configure application.properties
3. Run Spring Boot application

### Frontend
1. Install dependencies
2. Configure API URL
3. Run React development server

This structure supports:
- User authentication/authorization
- File upload/download
- Protected routes
- Error handling
- Modular component design