# Use the official Node.js Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Expose the API Gateway port (8080)
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]
