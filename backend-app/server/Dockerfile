FROM node:14.17-alpine

WORKDIR /app/back

COPY package*.json ./

RUN npm install 

COPY . .

RUN npx prisma generate


CMD ["sh", "run.sh"]