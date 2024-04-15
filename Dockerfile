FROM node:10-alpine
# Copying needed files from directory
COPY . /
EXPOSE 5000
RUN npm install .
CMD npm start