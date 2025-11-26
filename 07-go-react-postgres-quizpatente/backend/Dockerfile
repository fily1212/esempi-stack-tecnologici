FROM golang:1.21-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main ./cmd/api

FROM alpine:latest
WORKDIR /app
COPY --from=build /app/main .
COPY domande.csv .

EXPOSE 8080
CMD ["./main"]
