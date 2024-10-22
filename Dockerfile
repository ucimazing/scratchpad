# Use the official Node.js image as the base image
FROM node:18

# Create and set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the application runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
