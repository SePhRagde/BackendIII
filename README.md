# Pet Adoption API

A RESTful API for a pet adoption platform with user authentication, file uploads, and role-based access control.

## Features

- User authentication with JWT
- Role-based access control (admin, user)
- File uploads for user documents and pet images
- Pet management (create, read, update, delete)
- User profile management
- API documentation with Swagger
- Comprehensive error handling
- Logging system
- Test suite with Mocha and Chai

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pet-adoption-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/pet-adoption

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h

# File Upload Configuration
MAX_FILE_SIZE=5242880 # 5MB in bytes
UPLOAD_DIR=uploads

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

4. Create required directories:
```bash
mkdir -p uploads/documents uploads/pets logs
```

## Docker

### Using Docker Image

The application is available as a Docker image. You can run it using:

```bash
docker run -p 3000:3000 \
  -e MONGO_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e PORT=3000 \
  sephragde/pet-adoption-api:latest
```

DockerHub Image: [sephragde/pet-adoption-api](https://hub.docker.com/r/sephragde/pet-adoption-api)

### Building from Source

To build the Docker image locally:

```bash
# Build the image
docker build -t pet-adoption-api .

# Run the container
docker run -p 3000:3000 \
  -e MONGO_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e PORT=3000 \
  pet-adoption-api
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```