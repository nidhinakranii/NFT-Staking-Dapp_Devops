# Use the official Node.js 18 image as a base
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies for the backend
COPY smart_contracts/package.json smart_contracts/yarn.lock ./smart_contracts/
RUN cd smart_contracts && npm install

# Copy package.json and install dependencies for the frontend
COPY frontend/package.json frontend/yarn.lock ./frontend/
RUN cd frontend && npm install

# Copy the rest of the application code
COPY . .

# Expose ports (adjust if necessary)
EXPOSE 3000

# Start both backend and frontend (adjust commands as needed)
CMD ["sh", "-c", "cd smart_contracts && node scripts/deploy-vault.js & cd frontend && npm start"]
