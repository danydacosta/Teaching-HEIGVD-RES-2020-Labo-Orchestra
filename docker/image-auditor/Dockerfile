FROM node:latest

COPY src/ /opt/app

WORKDIR /opt/app
RUN npm install 

ENTRYPOINT ["node", "/opt/app/app.js"]