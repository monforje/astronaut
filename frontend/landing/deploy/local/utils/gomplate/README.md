# gomplate

Шаблоны файлов через gomplate в контейнере. В шаблон передаётся всё окружение, включая env из Taskfile.yml проекта.

```bash
task gomplate -- --file build/local/Dockerfile.tpl --out build/local/Dockerfile
```

Используется в task build и task cicd-build:

- LOCAL_DOCKERFILE_TEMPLATE, LOCAL_TEMPLATE_OPTS - шаблон Dockerfile для task build
- CICD_DOCKERFILE_TEMPLATE, CICD_TEMPLATE_OPTS, CICD_IMAGE - шаблон и образ для task cicd-build

Пример шаблона - build/local/Dockerfile.tpl из backend/example:

```dockerfile
FROM {{ .Env.DOCKER_GO_IMAGE_NAME }} AS tools
RUN go install github.com/air-verse/air@{{ .Env.AIR_VERSION }}

FROM {{ .Env.DOCKER_GO_IMAGE_NAME }}
COPY --from=tools /go/bin/air /usr/local/bin/air
```

DOCKER_GO_IMAGE_NAME и AIR_VERSION берутся из env Taskfile.yml сервиса.
