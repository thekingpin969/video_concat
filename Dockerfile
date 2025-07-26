# Use Node base image with ffmpeg installed
FROM jrottenberg/ffmpeg:4.4-ubuntu as ffmpeg

FROM node:18

# Copy ffmpeg binaries from previous stage
COPY --from=ffmpeg /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg
COPY --from=ffmpeg /usr/local/bin/ffprobe /usr/local/bin/ffprobe

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy app code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
