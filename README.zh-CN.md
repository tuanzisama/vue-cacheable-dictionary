# vue-cacheable-dictionary

[English README](./README.md)

一个面向 Vue 3 的可缓存字典加载器：维护响应式字典仓库、去重并发请求，并支持按 key 随用随取。

## 安装

```bash
pnpm add vue-cacheable-dictionary
# 或
npm i vue-cacheable-dictionary
```

## 使用

通常在一个 composable/模块中创建单例，提供 `load` 方法，然后按需查询字典。

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

组件内使用：

```ts
import { computed } from 'vue'
import { useDict } from './useDict'

const store = useDict(['type', 'status'])

const statusLabel = computed(() => store.get('status')?.label(1) ?? '')
```

## 你会得到什么

- `createDictionaryInstance(...)`：创建实例，负责缓存与请求去重。
- `DictArray`：类数组封装，提供 `pick` / `omit` / `label` / `item` 等便捷方法。
- `DictItem` / `DictKey`：字典数据类型定义。

## 说明

- 只有字符串类型的 key 会传给 `load(...)`；非字符串 key（例如 `Symbol`）会被忽略，不会触发远程请求。
- 字典仓库底层是 `Map` 且具备响应式能力，可直接用于模板与 computed。

## 开发

```bash
pnpm install
pnpm play
pnpm test
pnpm build
pnpm typecheck
```

## 贡献

- 通过 Issue 提交 bug/需求。
- 提交 PR 时保持改动聚焦，并写清楚变更目的与影响范围。
- 提交前确保 `pnpm test` 与 `pnpm typecheck` 通过。

## 许可证

MIT

