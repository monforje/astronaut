# prek

Pre-commit хуки. prek ставится в ~/.local/bin, команды выполняются в корне проекта.

```bash
task init-hooks
task prek -- run --all-files
task prek -- run golangci-lint --files cmd/http/main.go
```

Конфиг хуков - .pre-commit-config.yaml проекта, готовые лежат в lang/<язык>/.
