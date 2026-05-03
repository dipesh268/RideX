#node image
FROM node:18-alpine

#Working directory
WORKDIR /app

#Copy
COPY package*.json ./

#Install
RUN npm install

#Copy
COPY . . 

#Expose
EXPOSE 5000

#CMD
CMD ["npm","start"]
