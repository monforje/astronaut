ARG GO_IMAGE=golang:1.27.0-alpine3.23

FROM ${GO_IMAGE} AS build
ARG OGEN_VERSION
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    CGO_ENABLED=0 GOBIN=/out go install github.com/ogen-go/ogen/cmd/ogen@${OGEN_VERSION}

# Go остаётся в образе: кодогенератор форматирует результат и читает go.mod проекта.
FROM ${GO_IMAGE}
COPY --from=build /out/ogen /usr/local/bin/ogen
WORKDIR /app
