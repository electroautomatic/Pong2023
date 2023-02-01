FROM node:18-alpine3.16

WORKDIR /app/front

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]