FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY backend ./backend
EXPOSE 3010
CMD ["npm", "start"]
