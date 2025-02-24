FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@11.1.0

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
