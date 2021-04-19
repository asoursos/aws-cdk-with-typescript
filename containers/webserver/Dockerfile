# Building container
FROM node:12 as build

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build:ts 
RUN npm prune --production

# Serving container
FROM node:12 as serve

WORKDIR /usr/src/app
COPY --from=build "/usr/src/app/dist/" "/usr/src/app/dist/"
COPY --from=build "/usr/src/app/views/" "/usr/src/app/views/"
COPY --from=build "/usr/src/app/node_modules/" "/usr/src/app/node_modules/"
COPY --from=build "/usr/src/app/package.json" "/usr/src/app/package.json"

EXPOSE 8080
CMD [ "node", "dist/app.js" ]