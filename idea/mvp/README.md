# MVP: юзкейсы, области и макеты

> [← Карта проработки](../skelet/README.md) · [Вопросы](../questions.md) · [Решения](../skelet/decisions.md)

Здесь собрано всё про состав первой версии: что делает продукт для человека и как устроена предметная область. Черновик.

| Файл или папка | Что |
|---|---|
| [mvp-usecases.md](mvp-usecases.md) | юзкейсы верхнего уровня: акторы, 13 юзкейсов, хребет MVP (симлинк на `../skelet/product/`) |
| [mvp-promises.md](mvp-promises.md) | что обещаем в письмах и питчах и чем это покрыто (симлинк на `../skelet/product/`) |
| [ddd-contexts.md](ddd-contexts.md) | предметная область: 10 областей, связи, путь контейнера, главные объекты, язык |
| [ddd-images/](ddd-images/) | PNG схем из `ddd-contexts.md`; пересборка: `bash utils/build-diagrams.sh` |
| [usecases/](usecases/README.md) | каждый юзкейс в своей папке: как это для клиента, что сделать, бизнес-логика, бэкенд (заглушка); [фейк-данные](usecases/fake-data.md); [боковое меню](usecases/side-nav.md) |
| [utils/](utils/build-diagrams.sh) | скрипт и настройки сборки картинок mermaid |

Нужен node и google-chrome для пересборки картинок. Пока делаем моки и визуал на вымышленных данных, бэкенд не пишем.
