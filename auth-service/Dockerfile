FROM node:alpine

# Environment Variables
# ENV TJ_AUTH_MONGO_URI=TJ_AUTH_MONGO_URI
# ENV TJ_AUTH_PORT=TJ_AUTH_PORT
# ENV TJ_JWT_KEY=TJ_JWT_KEY

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "start"]