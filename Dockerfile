# backend/Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --production
COPY . .
EXPOSE 8080
CMD ["yarn", "start"]
