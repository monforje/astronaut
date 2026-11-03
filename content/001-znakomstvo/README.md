# Пост 1: знакомство с продуктом

Первый пост для Telegram-канала. Цель: коротко объяснить, что делает Astronaut, и позвать логистов рассказать о своих проблемах с документами.

| Файл | Что |
|---|---|
| `post.md` | Текст для ручной вставки в Telegram (`**жирный**`), 744 знака из 1024 |
| `post.html` | Тот же текст в Telegram HTML, для бота и API |
| `preview.html` | Исходник превью, шрифты и логотип берутся из `../brand/` |
| `preview.png` | Готовая картинка 1280×1024 для поста |

Пересобрать картинку:

```bash
google-chrome --headless=new --no-sandbox --allow-file-access-from-files --hide-scrollbars \
  --window-size=1280,1024 --virtual-time-budget=3000 --screenshot=preview.png file://$PWD/preview.html
```

## Источники

Все утверждения из [10-shpargalka.md](../../idea/product/10-shpargalka.md). Пример расхождения на картинке взят из [cta.md](../../idea/skelet/brand/messaging/cta.md) и помечен как пример.

## TODO

- [TODO] Контакт для обратной связи (бот, Telegram, почта). В тексте сейчас «напишите», без адреса.
- [TODO] Подтвердить, что канал и название уже можно называть публично.
