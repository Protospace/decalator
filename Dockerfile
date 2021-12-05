FROM node:16.13
RUN apt update
RUN apt install -y fonts-liberation fonts-liberation2
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
ENTRYPOINT ["node", "index.js"]
