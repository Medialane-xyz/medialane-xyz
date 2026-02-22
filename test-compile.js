const { CallData, byteArray } = require("starknet");

const b1 = byteArray.byteArrayFromString("Mizu Drop");
const b2 = byteArray.byteArrayFromString("DROP");
const b3 = byteArray.byteArrayFromString("bafkreidxvsqvsqr2eys6a7iabpxtrdif46qbs4d2e2o5q6q2aie");

console.log("ByteArray objects:");
console.log(JSON.stringify({ name: b1, symbol: b2, base_uri: b3 }, null, 2));

console.log("\nCompiled raw CallData:");
const compiled = CallData.compile({
    name: b1,
    symbol: b2,
    base_uri: b3,
});
console.log(JSON.stringify(compiled, null, 2));
