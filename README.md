# AnyLLM

Small TypeScript project I made to try sending the same API request to a few
different AI providers. It is mostly for learning how API routing, config
files, and API keys work.

There are no plans, subscriptions, payments, or paid features in this repo.
You add your own provider API key in the config file and can call the OpenAI-
or Anthropic-style endpoints locally. Some outside providers may charge for
their own API keys; this project does not collect or mark up those charges.

## Run it

```bash
pnpm install
cp config/config.example.yaml config/config.yaml
# put your own test keys in config/config.yaml
pnpm dev
```

This is a learning project, so the config examples and routes are kept pretty
simple on purpose.
