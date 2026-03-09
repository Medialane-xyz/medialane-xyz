const { RpcProvider } = require("starknet");

async function checkTx() {
    const provider = new RpcProvider({ nodeUrl: "https://rpc.starknet.lava.build" });
    try {
        const tx = await provider.getTransaction("0x02d8f698cd81ede37417baba8ef84a9b0171c3cfeb662b407174216fed6f1abc");
        console.log(JSON.stringify(tx, null, 2));
    } catch (e) {
        console.error("Error fetching TX:", e.message);
    }
}
checkTx();
