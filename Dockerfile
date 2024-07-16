FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy backend package.json and yarn.lock
COPY smart_contracts/package.json ./smart_contracts/
COPY smart_contracts/yarn.lock ./smart_contracts/

# Install backend dependencies
RUN yarn --cwd smart_contracts install

# Copy frontend package.json and yarn.lock
COPY front-end/package.json ./front-end/
COPY front-end/yarn.lock ./front-end/

# Install frontend dependencies
RUN yarn --cwd front-end install

# Copy the rest of the application code
COPY . .

# Set the entry point for the application
CMD ["node", "smart_contracts/scripts/deploy.js"]
