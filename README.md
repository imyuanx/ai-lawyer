# AI 维权律师

一个基于 ChatGPT、帮助更多的人维护自身权益的 AI 律师

[AI 维权律师 \[点击跳转\]](https://ai-lawyer.yuanx.me)
完全免费，由我提供 OpenAI API key（已内置）

Prompt 见：[src/page/api/generateIndictment.ts 94行 - 103行](https://github.com/imyuanx/ai-lawyer/blob/66077b86f45cee2e3e2dfcae5633797632ed0fab/src/pages/api/generateIndictment.ts#L94-L103)

## Getting Started

```bash
pnpm dev
```

## Distribution

如果你要搭建自己的私有 AI 维权律师，请将 OpenAI API key 写入环境变量：`OPENAI_API_KEY`

```bash
pnpm run build
```