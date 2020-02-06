FROM node
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install -g typescript
EXPOSE 8080
CMD ["npm", "start"]