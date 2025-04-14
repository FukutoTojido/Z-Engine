import ZEngine from "../src/ZEngine";

const engine = new ZEngine("ws://127.0.0.1:24050/ws");
await engine.init_jq();
engine.register_jq(".menu.bm.metadata.title", (oldValue, newValue) => {
	console.log(oldValue, newValue);
});
