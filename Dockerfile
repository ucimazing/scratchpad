# Use the official Nginx image from Docker Hub
FROM nginx:alpine
# Copy the contents of the project folder to the Nginx web server directory
COPY . /usr/share/nginx/html
# Expose port 80 so the web server is accessible on the browser
EXPOSE 80
