FROM node:16 AS build-env
COPY . /app
WORKDIR /app

RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs16-debian11
COPY --from=build-env /app /app
WORKDIR /app

EXPOSE 6080
CMD ["src/Serverlogs.js"]