FROM golang:latest

WORKDIR /usr/src/app
RUN mkdir /usr/src/app/pb_data

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -v -o /usr/local/bin/app ./...

EXPOSE 8090

RUN app superuser create testing@parx.site testingparx
CMD ["app", "serve", "--http=0.0.0.0:8090"]
