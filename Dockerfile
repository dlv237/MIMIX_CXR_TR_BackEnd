FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
CMD ["sh", "-c", "sleep 5 && yarn sequelize db:migrate && yarn sequelize-cli db:seed:all && yarn dev"]
EXPOSE 3000
