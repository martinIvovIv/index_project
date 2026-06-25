FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm run openapi

EXPOSE 3003

CMD ["npm", "run", "dev"]