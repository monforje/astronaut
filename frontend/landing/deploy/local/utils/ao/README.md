# ao

Локальный HTTPS без mkcert: [ao](https://s3.kornishon.me/ao-bin) v0.1.0 (MIT,
`bin/LICENSE`) делает три вещи:

1. **CA** — создаёт локальный корневой сертификат и ставит его в доверенные:
   системное хранилище (sudo только на эту часть) и NSS-базы Firefox/Chrome
   (нужен `certutil`: `sudo apt install libnss3-tools`, без него — только система).
2. **Сертификаты** — выпускает leaf-сертификаты под домены, раскладка как у mkcert
   (`NAME.pem` + `NAME-key.pem`), срок 825 дней.
3. **/etc/hosts** — держит в нём **один** управляемый блок `# >>> ao:begin …`,
   собранный из `ao.toml`.

## Бинарники

Лежат в репо, в `bin/`, по одному на платформу — ничего не скачивается:

| Файл | Платформа |
|---|---|
| `ao-linux-amd64` | Linux x86_64 (static musl — и NixOS) |
| `ao-linux-arm64` | Linux aarch64 |
| `ao-darwin-amd64` | macOS Intel |
| `ao-darwin-arm64` | macOS Apple Silicon |
| `ao-windows-amd64.exe` | Windows x86_64 |

Задачи выбирают нужный сами (`bin/ao-{{OS}}-{{ARCH}}`). Обновить ao — заменить
файлы свежими из релиза (`ao-vX.Y.Z-<target>.tar.gz` в бакете `ao-bin`, в
архиве — `ao`, `README.md`, `LICENSE`).

## Команды

```bash
task trust             # CA + сертификат на домены ao.toml проекта
task untrust           # удалить сертификат проекта
task ca-install        # доверие к CA в системе и браузерах (повторно — ничего не делает)
task ao -- doctor      # что не так: hosts, хранилища доверия, certutil, резолв доменов
task ao -- ca status ~/.deploy-templates/certs/ca/rootCA.pem   # доверен ли CA везде (без пути ao проверит CA mkcert)
task ao -- list        # ao.toml проекта и совпадает ли с ним /etc/hosts
```

## ao.toml

Домены проекта — в `ao.toml` в его корне. `task trust` выпускает под них
сертификат `CERT_NAME` (задаётся в Taskfile проекта), traefik отдаёт его по SNI.

```toml
default_ip = "127.0.0.1"

[hosts]
"127.0.0.1" = ["demo.astronaut.localhost"]
```

Поменяли домены — `task trust` перевыпустит сертификат: проверяется не наличие
файла, а что в нём есть все домены.

## /etc/hosts — только по просьбе

`*.localhost` резолвят сами браузеры, curl и systemd-resolved, так что стенду
`/etc/hosts` не нужен. А блок ao в нём на машине **один**: `ao sync` из этого
репо выкинул бы домены соседних стендов, которым hosts может быть нужен.
Поэтому `task trust` hosts не трогает. Если всё же нужно
(macOS без systemd-resolved, утилиты без своего резолва `.localhost`):

```bash
task trust AO_HOSTS=true   # ao sync --from-root <корень монорепо>
```

## Где что лежит

`~/.deploy-templates/certs` (`CERTS_DIR`) — общий на машину: один CA
(`ca/rootCA.pem`) и один traefik на все локальные стенды (в том числе соседних
репозиториев). Сертификат стенда — `<CERT_NAME>.pem`, у demo-site —
`astronaut-demo-site.pem`.
