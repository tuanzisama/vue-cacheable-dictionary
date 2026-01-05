import { createDictionaryInstance } from '../../../../src'
import { type DictItem } from '../../../../src'

interface PlayDict extends DictItem {
  /**
   * 可能的 color 值
   */
  color?: string
}

const instance = createDictionaryInstance<PlayDict>({
  load: dicts => {
    return fetch(`/dict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dicts),
    }).then(res => res.json())
  },
})

/**
 * 查询字典数据
 *
 * 优先从缓存中读取，不存在则进行远程查询
 *
 * @param dicts 要查询的字典
 * @returns 字典存储器 (store)
 * @example
 * const dict = useDict(['type', 'status']);
 * const dict2 = useDict(['type', 'order_type']); // duplicate for test.
 *
 * dict1.get('order_type'); // ok.
 * dict2.get('status'); // ok.
 */
const useDict = instance.getDictData

/**
 * Alias for `useDict`.
 *
 * Recommended to use `useDict` instead. It's much shorter.
 * @alias useDict
 */
const useDictionary = useDict

export { useDict, useDictionary }
