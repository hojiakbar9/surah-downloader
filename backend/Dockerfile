FROM node:18-alpine

# 2. INSTALL FFMPEG SYSTEM-WIDE

RUN apk add --no-cache ffmpeg

# 3. Create app directory
WORKDIR /app

# 4. Install dependencies
COPY package*.json ./
RUN npm install --production

# 5. Copy the rest of the code
COPY . .

# 6. Create the temp directory for jobs
RUN mkdir -p tmp/mushaf-jobs

# 7. Expose the port 
EXPOSE 3000

# 8. Start the server
CMD ["node", "server.js"] 