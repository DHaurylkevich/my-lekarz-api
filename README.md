# MyLekarz API

This project is a backend API for MyLekarz web application that allows customers to book a doctor's appointment.

## Технологии:

The project uses the following technologies and libraries:

- **Backend**:

  - Node.js
  - Express
  - PostgreSQL
  - Sequelize

- **Безопасность**:

  - bcrypt (password hashing)
  - jsonwebtoken (JWT for authentication)
  - helmet
  - express-validator (data validation)
  - express-jwt (middleware for JWT)
  - express-session
  - passport
  - passport-google-oauth20 (OAuth2 authentication via Google)
  - passport-local (local authentication)

- **File Storage**:

  - cloudinary (cloud storage for images)
  - multer (middleware for multipart/form-data processing)
  - multer-storage-cloudinary (multer integration with cloudinary)

- **Logging**:

  - morgan
  - winston

- **API Documentation**:

  - swagger-jsdoc (generation of Swagger documentation)
  - swagger-ui-express (Swagger UI)

- **Testing**:

  - mocha (test framework)
  - chai (assertion library)
  - chai-as-promised (assertions for promises)
  - supertest
  - faker
  - mochawesome

- **Other**:
  - socket.io
  - express-socket.io-session
  - socket.io-client

## Installation

### 1. Clone the repository:

```bash
    git clone https://github.com/DHaurylkevich/doc-web.git
    cd doc-web
```

### 2. Install dependencies:

```bash
    npm install
```

### 3. Create an .env file and add the necessary environment variables:

```
    DATABASE_URL=mysql://user:password@localhost:3306/mylekarz
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    SESSION_SECRET=your_session_secret
```

On first power on, to synchronise the database and models:

```
DB_SYNC=true
```

### 4. Start database migrations:

    npx sequelize-cli db:migrate

### 5. Filling the database:

    npx sequelize-cli db:seed:all

### 6. Start server

    npm start

## Tests

To run tests, use the command:

    npm test

## Documentation

    ### Documentation for API
    http://localhost:3000/api-docs/

    ### Documentation for tests
    npx mocha testfile.js --reporter mochawesome
    Open file mochawesome.html

## Структура проекта

    src/
    ├── config/        # Config
    ├──── controllers/ # Controllers for request processing
    ├──── middleware/ # Intermediate handlers
    ├─── models/ # Sequelise data models
    ├─── routes/ # API routing
    ├──── services/ # Business logic
    ├──── socketHandlers # WebSocket handlers
    ├──── utils/ # Auxiliary utilities
    tests/
    ├──── integration/ # Integration tests
    ├─── unit/ # Unit tests
