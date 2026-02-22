const { RpcProvider, Contract, CallData, byteArray } = require("starknet");

async function testCall() {
    const provider = new RpcProvider({ nodeUrl: "https://starknet.drpc.org" });

    const contractAddress = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";
    console.log("Fetching ABI for", contractAddress);
    try {
        const { abi } = await provider.getClassAt(contractAddress);
        if (!abi) {
            console.error("No ABI found!");
            return;
        }

        const testContract = new Contract(abi, contractAddress, provider);
        testContract.connect(provider);
        console.log("ABI Fetched.");

        console.log("Populating calldata from string natively via JS params:");
        try {
            const populated = testContract.populate("create_collection", {
                name: "Mizu Drop",
                symbol: "DROP",
                base_uri: "ipfs://test"
            });
            console.log("Populated Output (Raw Strings):", JSON.stringify(populated.calldata));
        } catch (e) {
            console.error("Error populating strings natively:", e.message);
        }

        console.log("\nPopulating via ByteArray objects:");
        try {
            const populatedBA = testContract.populate("create_collection", {
                name: byteArray.byteArrayFromString("Mizu Drop"),
                symbol: byteArray.byteArrayFromString("DROP"),
                base_uri: byteArray.byteArrayFromString("ipfs://test")
            });
            console.log("Populated Output (ByteArray objects):", JSON.stringify(populatedBA.calldata));
        } catch (e) {
            console.error("Error populating ByteArrays:", e.message);
        }
    } catch (e) {
        console.error("Execution error:", e.message);
    }
}
testCall();
