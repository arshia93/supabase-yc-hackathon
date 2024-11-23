const util = require("./debug_util");

async function main() {
  const response = await util.getSupabaseClient().functions.invoke(
    "track-event",
    {
      body: {
        domain: "reactiverobot.com",
        route: "/",
        event_name: "page_view",
        anon_id: "123",
      },
    },
  );

  console.log(response);
}

main().catch(console.error);
