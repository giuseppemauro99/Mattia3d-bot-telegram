# Puppeteer recommends using the Node LTS version, but you can choose what fits your needs
FROM rcormie/puppeteer-nodejs-18:v1.0.0

# Create app directory
WORKDIR /app

# Install app dependencies
# Copies package.json and package-lock.json to Docker environment
#COPY package*.json ./
COPY package.json ./


RUN yarn config set loglevel info
#RUN npm config set loglevel info
#RUN npm config set registry http://registry.npmjs.org/
#RUN npm set progress=false 

# Install puppeteer, don't install Chromium as it will be installed manually later
#RUN yarn add puppeteer --no-install-recommends
RUN yarn add axios
RUN yarn add express

# Copy app source to Docker environment
COPY . .

# You can expose any port your app is configured to use, like 8080 for example
EXPOSE 8282

# Add a /app/sended_post.js volume
VOLUME ["/app/data"]

VOLUME ["/app/screenshot"]

# Run your application when container launches
CMD [ "node", "server.js" ]
