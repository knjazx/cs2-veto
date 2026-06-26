# CS2 Veto System

Веб-приложение для проведения процедуры вето (выбор/бан карт) в CS2.

## Запуск

### 1. Backend (FastAPI + Socket.io)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:5173

---

## Архитектура

```
cs2-veto/
├── backend/
│   ├── main.py          # FastAPI + Socket.io ASGI сервер
│   ├── veto_logic.py    # FSM логика вето (бан/пик, смена хода)
│   ├── models.py        # Pydantic модели состояния лобби
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx       # Создать / войти в лобби
    │   │   └── VetoRoom.jsx   # Основная страница вето
    │   ├── components/
    │   │   ├── MapGrid.jsx        # Сетка карт с логикой кликов
    │   │   ├── VetoStatus.jsx     # Индикатор хода + таймлайн шагов
    │   │   ├── FormatSelector.jsx # Выбор BO1/BO3/BO5
    │   │   └── LobbyInfo.jsx      # Инвайт-ссылка
    │   ├── hooks/
    │   │   └── useSocket.js   # Socket.io хук
    │   └── lib/
    │       └── vetoMeta.js    # Зеркало sequence для UI
    └── ...
```

## Socket.io события

| Событие (клиент → сервер) | Данные | Описание |
|---|---|---|
| `join_lobby` | `{room_id, team}` | Войти в комнату как Team A или B |
| `set_format` | `{room_id, format}` | Выбрать BO1/BO3/BO5 (только Team A) |
| `veto_action` | `{room_id, team, map}` | Выполнить бан или пик карты |

| Событие (сервер → клиент) | Данные | Описание |
|---|---|---|
| `lobby_state` | `LobbyState` | Полное состояние после каждого действия |
| `error` | `{message}` | Ошибка (не твой ход, карта уже сбанена и т.д.) |

## Логика смены хода

Вся логика хранится в `veto_logic.py` в виде FSM:

1. `VETO_SEQUENCES[format]` — фиксированный массив шагов `[(team, action), ...]`
2. `current_step` — указатель на текущий шаг
3. При каждом `apply_action()` сервер:
   - Проверяет, что действующая команда совпадает с `sequence[current_step].team`
   - Применяет действие к карте
   - Инкрементирует `current_step`
   - Если шаги закончились — остаток карт = Decider, `finished = True`
4. Новое состояние эмитируется всем в комнате через `lobby_state`

Клиент **никогда не знает, чья очередь** самостоятельно — он только получает `current_turn` от сервера.

## Добавление реальных изображений карт

Положите файлы в `frontend/public/maps/`:
- `mirage.jpg`, `inferno.jpg`, `nuke.jpg`, `overpass.jpg`
- `ancient.jpg`, `anubis.jpg`, `vertigo.jpg`

В `MapCard.jsx` раскомментируйте тег `<img>` и закомментируйте placeholder `<div>`.
