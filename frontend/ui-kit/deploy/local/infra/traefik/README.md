# traefik

Общий reverse proxy на машину. Слушает 80 и 443, http редиректит на https. Один на все локальные стенды,
в том числе соседних репозиториев: проект `shared-proxy`, контейнер и сеть `traefik`; если он уже поднят,
`task proxy-start` его не трогает.

## Команды

```bash
task proxy-start
task proxy-stop
task proxy-down
task proxy-certs
```

## Домен для сервиса

Домены `*.astronaut.localhost` покрыты wildcard-сертификатом по умолчанию (если его выпустил этот стенд).
Домены проекта — в `ao.toml` в корне проекта, сертификат под них выпускает ao (`utils/ao`):

```bash
task trust
task untrust
```

`*.localhost` резолвится сам (браузеры, curl, systemd-resolved) — /etc/hosts не нужен.

Лейблы сервиса в compose проекта:

```yaml
services:
  http:
    networks: [default, traefik]
    labels:
      traefik.enable: "true"
      traefik.docker.network: traefik
      traefik.http.routers.my-project.rule: Host(`my-project.astronaut.localhost`)
      traefik.http.services.my-project.loadbalancer.server.port: "8080"

networks:
  traefik:
    external: true
```

## Сертификаты

Сертификаты лежат в `~/.deploy-templates/certs`, общие для всех проектов на машине; `dynamic.yml` там же
собирается из всех `*.pem`. Перевыпуск сертификата по умолчанию:

```bash
rm ~/.deploy-templates/certs/_default*.pem
task proxy-start
```

Контейнеры ходят друг к другу по внутренней docker сети, не через traefik.
