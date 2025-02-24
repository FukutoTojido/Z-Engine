// biome-ignore lint/suspicious/noExplicitAny: It is complicated
export type Data = Record<string, any>;

// biome-ignore lint/suspicious/noExplicitAny: <It is complicated>
type Callback = (oldValue: any, newValue: any, newData: Data) => void;
type Entry = Map<string, Set<Callback>>;

export default class ZEngine {
	cache: Data = {};
	entries: Entry = new Map();

	constructor(url: string) {
		const ws = new WebSocket(url);
		ws.addEventListener("open", () => console.log("WebSocket connected!"));
		ws.addEventListener("close", () => console.log("WebSocket disconnected!"));
		ws.addEventListener("error", (error) => {
			ws.close();
			console.error(error);
		});
		ws.addEventListener("message", (event) => {
			const data: Data = JSON.parse(event.data);
			this.update(data);
		});
	}

	register(key: string, callback: Callback) {
		if (!this.entries.get(key)) {
			this.entries.set(key, new Set());
		}
		this.entries.get(key)?.add(callback);
	}

	unregister(key: string, callback: Callback) {
		this.entries.get(key)?.delete(callback);
		if (this.entries.get(key)?.size === 0) {
			this.entries.delete(key);
		}
	}

	private update(newData: Data) {
		for (const key of this.entries.keys()) {
			const oldValue = this.search(key, this.cache);
			const newValue = this.search(key, newData);
			const callbacks = this.entries.get(key);

			if (!callbacks) continue;
			for (const callback of callbacks)
				if (oldValue !== newValue) callback(oldValue, newValue, newData);
		}

		this.cache = newData;
	}

	private search(key: string, obj: Data) {
		const attrs = key.split(".");
		let curr = obj;
		for (const attr of attrs) {
			if (!(curr instanceof Object)) return curr;
			curr = curr[attr];
		}

		return curr;
	}
}
