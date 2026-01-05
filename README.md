# vue-cacheable-dictionary

[中文 README](./README.zh-CN.md)

A small cacheable dictionary loader for Vue 3. It keeps a reactive store, dedupes in-flight requests, and lets you query dictionaries by key from anywhere.

## Install

```bash
pnpm add vue-cacheable-dictionary
# or
npm i vue-cacheable-dictionary
```

## Usage

Create a single instance (usually in a composable/module), provide a `load` function, then query dicts on demand.

```ts
import { createDictionaryInstance, type DictItem } from 'vue-cacheable-dictionary'

interface MyDictItem extends DictItem {
  color?: string
}

const dict = createDictionaryInstance<MyDictItem>({
  load: async (dicts) => {
    const res = await fetch('/dict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dicts),
    })
    return res.json() as Promise<Record<string, MyDictItem[]>>
  },
})

export const useDict = dict.getDictData
```

In components:

```ts
import { computed } from 'vue'
import { useDict } from './useDict'

const store = useDict(['type', 'status'])

const statusLabel = computed(() => store.get('status')?.label(1) ?? '')
```

## What you get

- `createDictionaryInstance(...)`: creates an instance that manages caching and request deduplication.
- `DictArray`: an array-like wrapper with helpers like `pick`, `omit`, `label`, and `item`.
- `DictItem` / `DictKey` types for typing your dictionaries.

## Notes

- Only string keys are sent to `load(...)`. Non-string keys (e.g. `Symbol`) are ignored for remote loading.
- The store is reactive and backed by a `Map`, so it works naturally in Vue templates/computed.

## Development

```bash
pnpm install
pnpm play
pnpm test
pnpm build
pnpm typecheck
```

## Contributing

- File an issue for bugs/feature requests.
- Send a PR with focused changes and a clear description.
- Ensure `pnpm test` and `pnpm typecheck` pass before opening a PR.

## License

MIT
