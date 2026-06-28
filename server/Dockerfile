FROM node:20-alpine

WORKDIR /app

# Copy manifests first so dependency layer is cached when only source changes
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the server source
COPY . .

# Back4app injects PORT at runtime; 5000 is the local fallback
EXPOSE 5000

CMD ["npm", "start"]
