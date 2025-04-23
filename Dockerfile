# ---- Build Stage ----
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Run the build command 
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
COPY --from=builder /app/src/data ./src/data

# Expose the port the application listens on
EXPOSE ${PORT:-5000}

# The command to run the application
CMD ["node", "build/app.js"]
