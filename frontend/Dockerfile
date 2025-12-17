# /frontend/Dockerfile

# --- Stage 1: Build the React App ---
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build for production (creates /dist folder)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add a custom Nginx config to handle React Router (see step below)
# We will create this file in the next step
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]