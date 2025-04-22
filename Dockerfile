# ---- Build Stage ----
# Use a Node.js version that matches your development environment (e.g., 18 or 20)
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run the build command (adjust if your build script is different in package.json)
# This assumes you have a "build" script like "tsc" or "tsc -p ."
RUN npm run build

# ---- Runtime Stage ----
# Use a slim Node.js image for a smaller final image size
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files again
COPY package.json package-lock.json* ./

# Install *only* production dependencies
RUN npm ci --omit=dev

# Copy the built application code from the builder stage
COPY --from=builder /app/build ./build

# Copy runtime data files (like roadmap JSONs)
# Adjust the source path if your data directory is elsewhere
COPY --from=builder /app/src/data ./src/data

# Expose the port the application listens on
# Use the PORT environment variable, defaulting to 5000 if not set
# (Make sure your app respects process.env.PORT)
EXPOSE ${PORT:-5000}

# Define the command to run the application
# This assumes your entry point is build/app.js
CMD ["node", "build/app.js"]
