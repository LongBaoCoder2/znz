# 🚀 ZNZ Not Zoom

ZNZ is a user-friendly video conferencing application offering real-time audio and video communication, meeting management, and interactive features to make virtual collaboration seamless and engaging.

## ✨ Features

- Authentication and user management.
- Meeting creation and management.
- Real-time audio and video communication.
- Create and join meetings via link or ID and password.
- Real-time audio and video communication.
- Screen sharing.
- Chat functionality during meetings.
- Participant management (approve, remove, and transfer host rights).
- Adjustable meeting layout and user pinning.

## 🛠️ Technology Stacks
- [Vite + React](https://vite.dev/guide/): Frontend development.
- [Express.js](https://expressjs.com/): Backend framework.
- [Mediasoup](https://mediasoup.org/): WebRTC handling for real-time communication.
- [PostgreSQL](https://www.postgresql.org/): Database management.
- [Redis](https://redis.io/): In-memory data store for caching and real-time features.


## 🧑‍💻 Prerequisites

- Node.js (v22 or later)
- Yarn package manager
- Docker and Docker Compose

## 🚀 Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/LongBaoCoder2/znz.git
cd znz
```

### 2. Start the Database

Start the PostgreSQL database container using Docker Compose:

```sh
docker compose up -d
```

### 3. Install Dependencies

Install dependencies for both client and server:

```sh
yarn install
```

### 4. Run migrations

Run database migrations for both client and server:

```sh
yarn db:generate-dev
```

### 4. Run the Application

Start both the client and SFU server:

```sh
yarn dev
```


The client will be available at http://localhost:3000.
The SFU server will run on http://localhost:8000.

## 📁 Project Structure

```
.
├── .github             # github action workflows
├── client              # Vite React frontend
├── sfu                 # Express.js + Mediasoup backend
├── .editorconfig       # Editor configuration
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── DEVELOPMENT.md      # Development notes and guidelines
├── LICENSE             # License information
├── README.md           # Project documentation
├── docker-compose.yml  # PostgreSQL database setup
├── node_modules        # Node.js dependencies
├── package.json        # Project configuration
└── yarn.lock           # Yarn lockfile for dependencies
```


## 🧑‍💻 Environment Variables

Create .env files in both client and sfu folders and configure the following variables:

Client .env
```
VITE_USE_HTTPS=<true or false>
VITE_API_URL_HTTPS=<https://api.example.com>
VITE_API_URL_HTTP=<http://api.example.com>
```

SFU .env
```
USE_HTTPS=<true or false>
DATABASE_URL=<database connection string>
PORT=<port number>
SECRET_KEY=<secret key>
REFRESH_SECRET_KEY=<refresh secret key>
```

## 📝 Development Notes

Ensure Docker is running to start the PostgreSQL database.

Use `yarn dev` to run both client and server simultaneously.

Modify the `docker-compose.yml` file to update database configurations if needed.

## Future Enhancements

- Add screen sharing.
- Add emoji feedback and raising hand.
- Implement analytics and reporting for meetings.
- Improve UI/UX for a seamless user experience.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request for any feature or bug fix.

## License

This project is licensed under the MIT License.