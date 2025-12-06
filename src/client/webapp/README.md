## Description

This is the frontend application for the Zalo clone app. It is a React application that uses Vite as the build tool.

**Frontend is still under development**

## Development

```
cd src/client/webapp
npm install
npm run dev
```

## Docker

### Build the Docker image

```bash
cd src/client/webapp
docker build -t webapp-frontend .
```

### Run the container

```bash
docker run -d -p 8080:80 --name webapp-frontend webapp-frontend
```

The application will be available at `http://localhost:8080`

### Stop and remove the container

```bash
docker stop webapp-frontend
docker rm webapp-frontend
```
