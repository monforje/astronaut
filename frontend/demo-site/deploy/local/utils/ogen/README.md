# ogen

Сервер и клиент по OpenAPI. Образ собирается из `Dockerfile` при первом вызове, версия — `OGEN_VERSION` в `Taskfile.yml`.

`ogen.yml` — общий конфиг генератора (фичи), свой `ogen.yml` в корне проекта приоритетнее.
Генерацию запускает `task gen-api` из `lang/go`: `typespec/` → `schema/openapi/openapi.yaml` → `OGEN_TARGET`
(по умолчанию `internal/transport/http/gen`, пакет `OGEN_PACKAGE` = `gen`).

```bash
task gen-api
task ogen -- --help
```
