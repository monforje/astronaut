ARG GO_IMAGE=golang:1.27.0-alpine3.23

FROM ${GO_IMAGE} AS build
ARG SQLC_VERSION
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=0 GOBIN=/out go install github.com/sqlc-dev/sqlc/cmd/sqlc@${SQLC_VERSION}

# Go остаётся в образе: кодогенератор форматирует результат и читает go.mod проекта.
FROM ${GO_IMAGE}
COPY --from=build /out/sqlc /usr/local/bin/sqlc
WORKDIR /app
