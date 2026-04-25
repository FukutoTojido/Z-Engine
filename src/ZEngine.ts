const JQ = require("jqts").default;

// biome-ignore lint/suspicious/noExplicitAny: It is complicated
export type Data = Record<string, any>;

// biome-ignore lint/suspicious/noExplicitAny: <It is complicated>
type Callback = (oldValue: any, newValue: any, newData: Data) => void;
type Entry = Map<string, Set<Callback>>;

type jqItem = {
	pattern: typeof JQ;
	callbacks: Set<Callback>;
};
type jqEntry = Map<string, jqItem>;

type FilterOption = string | { field: string; keys: FilterOption[] };

export default class ZEngine {
	cache: Data = {};
	entries: Entry = new Map();
	jq_entries: jqEntry = new Map();

	constructor(url: string, filterOptions: FilterOption[] = []) {
		const ws = new WebSocket(url);
		ws.addEventListener("open", () => {
			console.log("WebSocket connected!");
			console.log(`Applied filters: ${filterOptions}`);

			ws.send(`applyFilters:${JSON.stringify(filterOptions)}`);
		});
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
		return callback;
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

		for (const { pattern, callbacks } of this.jq_entries.values()) {
			const oldValue = pattern.evaluate(this.cache)[0];
			const newValue = pattern.evaluate(newData)[0];

			if (!callbacks || oldValue === newValue) continue;
			for (const callback of callbacks) callback(oldValue, newValue, newData);
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

	register_jq(query: string, callback: Callback) {
		const pattern = JQ.compile(query);

		if (!this.jq_entries.get(query)) {
			this.jq_entries.set(query, {
				pattern,
				callbacks: new Set(),
			});
		}

		this.jq_entries.get(query)?.callbacks.add(callback);
		return callback;
	}

	unregister_jq(query: string, callback: Callback) {
		this.jq_entries.get(query)?.callbacks.delete(callback);
		if (this.jq_entries.get(query)?.callbacks.size === 0) {
			this.jq_entries.delete(query);
		}
	}
}
