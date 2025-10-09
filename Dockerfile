FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json for frontend and backend
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --prefix ./server
RUN npm install

# Install concurrently globally to run both processes
RUN npm install -g concurrently

# Copy all source code
COPY . .

# Expose frontend (8080) and backend (5000)
EXPOSE 8080
EXPOSE 5000

# Run both frontend (Vite dev) and backend (Express)
CMD concurrently "npm run dev" "node server/server.js"
