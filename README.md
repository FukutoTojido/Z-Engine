# Z-Engine
A [tosu](https://github.com/tosuapp/tosu) value listener module

# Installation
To install the package:
```bash
npm install @fukutotojido/z-engine
```

# Usage
```ts
import ZEngine from "@fukutotojido/z-engine";

const engine = new ZEngine("ws://127.0.0.1:24050/ws");
const titleElement = document.querySelector("#title");

engine.register("menu.bm.metadata.title", (oldValue, newValue) => {
    if (titleElement === null) return;
    titleElement.innerText = newValue;
});
```

# API
### `ZEngine(url: string)`
- `url`: tosu WebSocket url

Returns a new `ZEngine` object for registering and unregistering listeners.

### `register(key: string, callback: (oldValue, newValue, data) => void)`
- `key`: Indexing key for WebSocket data. For example, if your data is at `menu.bm.metadata.title`, your key should be `menu.bm.metadata.title`.
- `callback`: A callback that runs whenever the value of `key` gets updated which takes in an `oldValue` of the data, `newValue` of the data and `data` of the WebSocket data.

Register a callback that runs when a value update. You can add multiple callback to a value.

### `unregister(key: string, callback: (oldValue, newValue, data) => void)`
- `key`: Indexing key for WebSocket data. For example, if your data is at `menu.bm.metadata.title`, your key should be `menu.bm.metadata.title`.
- `callback`: A callback that runs whenever the value of `key` gets updated which takes in an `oldValue` of the data, `newValue` of the data and `data` of the WebSocket data.

Unregister a callback that runs when a value update. 