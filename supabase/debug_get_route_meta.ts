const util = require("./debug_util");

async function main() {
  const response = await util.getSupabaseClient().functions.invoke(
    "get-route-meta",
    {
      body: { url: "https://reactiverobot.com" },
    },
  );

  console.log(response);
}

main().catch(console.error);
