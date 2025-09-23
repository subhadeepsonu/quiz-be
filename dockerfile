FROM node:20.12.0-alpine3.19

WORKDIR /app

COPY . .

RUN npm install

RUN npx prisma generate

RUN npm install -g typescript

RUN pwd

RUN npx tsc

EXPOSE 3000

CMD ["npm", "start"]