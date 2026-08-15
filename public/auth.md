# Limrun auth.md

How agents authenticate against the Limrun API (`api.limrun.com`).

## Summary

- The control plane authenticates with API keys, sent as `Authorization: Bearer <key>`. Keys are created by a human in the console; agents cannot mint org API keys themselves.
- Keys have the prefix `lim_`. Create them at [console.limrun.com](https://console.limrun.com) under Settings, API Keys.
- The `lim` CLI and every SDK (TypeScript, Python, Go) read the key from the `LIM_API_KEY` environment variable by default:

```bash
export LIM_API_KEY=lim_...
curl https://api.limrun.com/v1/ios_instances \
  -H "Authorization: Bearer $LIM_API_KEY"
```

## Agent setup

If you are an agent operating on a user's behalf, ask the user to create an API key in the console and provide it as `LIM_API_KEY` in your environment. Do not use `lim login`; it is a browser flow for humans.

## Other credentials you will encounter

| Credential | Purpose |
|---|---|
| Org API key (`lim_...`) | REST control plane on `api.limrun.com`: create, list, and delete instances. |
| Per-instance token (`instance.status.token`) | Everything scoped to one running instance: device endpoints (`apiUrl`, WebSocket endpoints) and the instance's MCP server (`status.mcpUrl`), as `Authorization: Bearer`. Returned in the instance status when it is ready. |
| Scoped registry token (`lim_st_...`) | Short-lived, scope-limited token minted by your backend for browser use. |

Full details, including which credential each endpoint expects, are in the [SDK reference](https://docs.limrun.com/docs/reference/sdk.md).
