import { difference } from 'lodash-es'
import { DictionaryStore } from './store'
import type { DictItem, DictKey } from './dict'

export type { DictItem, DictKey } from './dict'
export { DictArray } from './dict'

interface DictionaryOptions<D extends DictItem = DictItem> {
  /**
   * Load dictionary data.
   * @param dicts The dicts to load. DictItem keys that are not of type string will be ignored.
   * @returns A promise that resolves to a record of dicts.
   */
  load: (dicts: string[]) => Promise<Record<string, D[]>>
}

interface DictionaryInstance<D extends DictItem = DictItem> {
  /**
   * Dictionary store.
   * @readonly
   */
  readonly store: DictionaryStore

  /**
   * Query queue for dict request.
   * @readonly
   */
  readonly queue: Set<DictKey>

  /**
   * Query dictionary data
   *
   * Read from cache first, fetch remotely if not present.
   *
   * @param dicts The dicts to query.
   * @returns The dictionary store.
   * @example
   * const dict = useDict(['type', 'status']);
   * const dict2 = useDict(['type', 'order_type']); // duplicate for test.
   *
   * dict1.get('order_type'); // ✅
   * dict2.get('status'); // ✅
   */
  getDictData: (dicts?: DictKey[]) => DictionaryStore<D>

  /**
   * Reload dictionary data.
   *
   * @param dicts The dicts to reload.
   * @returns A promise that resolves to a record of dicts.
   */
  reloadDictData: (dicts: DictKey[]) => Promise<Record<string, D[]>>
}

/**
 * Create a dictionary instance.
 * @param options The dictionary options.
 * @returns The dictionary instance.
 */
export function createDictionaryInstance<D extends DictItem = DictItem>(options: DictionaryOptions<D>): DictionaryInstance<D> {
  // Dictionary store
  const store = new DictionaryStore<D>()

  /**
   * Query queue for dict request.
   * @readonly
   */
  const fetchQueueSet = new Set<DictKey>()

  function getDictData(dicts?: DictKey[]): DictionaryStore<D> {
    if (!Array.isArray(dicts) || dicts.length === 0) {
      return store
    }

    const diff = difference(dicts, [...store.keys(), ...fetchQueueSet])

    if (diff.length > 0) {
      loadDictData(diff)
    }

    return store as DictionaryStore<D>
  }

  /**
   * Load dictionary data.
   * @param dicts The dicts to load.
   * @returns A promise that resolves to a record of dicts.
   */
  function loadDictData(dicts: DictKey[]) {
    dicts.forEach(dict => fetchQueueSet.add(dict))

    // ignore dict key are not string. for example, symbol.
    const requestDicts = dicts.filter(key => typeof key === 'string')

    return options.load(requestDicts)
      .then((response) => {
        for (const key in response) {
          if (Object.prototype.hasOwnProperty.call(response, key)) {
            store.addRaw(key, response[key])
          }
        }
        return response
      })
      .finally(() => {
        dicts.forEach(dict => fetchQueueSet.delete(dict))
      })
  }

  /**
   * Reload dictionary data.
   * @param dicts The dicts to reload.
   * @returns A promise that resolves to a record of dicts.
   */
  function reloadDictData(dicts: DictKey[]): Promise<Record<string, D[]>> {
    if (dicts && dicts.length > 0) {
      return loadDictData(dicts).then()
    }

    return Promise.resolve({})
  }

  return { store, queue: fetchQueueSet, getDictData, reloadDictData }
}
