## Project setup

```bash
1) npm i - устанавливаем зависимости
2) Поднимаем контейнер postgres в docker-compose.yml
3) Добавляем .env файл из env.example
4) npm run migration:run - накатывает миграции
5) npm run start - запускает приложение на 3000 порту, при инициализации UsersService создастся юзер c id=1 и balance 1000
```

## Единственный доступный эндпоинт:

### `POST /payments`

Принимает следующие поля в теле запроса (DTO):

- `userId`: `number` (целое положительное число) - Идентификатор пользователя.
- `amount`: `number` (положительное число) - Сумма платежа.
- `action`: `string` - Описание действия (например, 'deposit', 'withdrawal').
