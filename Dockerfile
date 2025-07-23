# Use official Node.js image
FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (incluye devDependencies para desarrollo)
COPY package*.json ./
RUN npm install

# Bundle app source (excluye .env* con .dockerignore)
COPY . .

# Expose the app port
EXPOSE 3000

# Set build-time environment (usado solo para npm install optimizaciones)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Command to run the application
CMD ["npm", "run", "start"]