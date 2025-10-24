FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy application files
COPY . .

# Build frontend
RUN cd client && npm run build

# Create output directory
RUN mkdir -p /app/output/images

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
