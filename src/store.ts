import { computed, shallowReactive } from 'vue'
import { DictArray, type DictItem, type DictKey } from './dict'

export class DictionaryStore<D extends DictItem = DictItem> {
  #store = shallowReactive(new Map<DictKey, DictArray<D>>())

  /**
   * A readonly handler.
   * For native invoke on two-direction data binding.
   */
  public readonly store = computed(() => this.#store)

  public add(key: DictKey, dict: DictArray<D>) {
    this.#store.set(key, dict)
  }

  public addRaw(key: DictKey, dict: D[]) {
    this.#store.set(key, new DictArray(dict))
  }

  public addAll(data: Record<DictKey, DictArray<D>>) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        this.add(key, data[key])
      }
    }
  }

  public delete(key: DictKey) {
    this.#store.delete(key)
  }

  public get(key: DictKey, defaultValue?: DictArray<D>) {
    return this.#store.get(key) ?? defaultValue
  }

  public size() {
    return this.#store.size
  }

  public keys() {
    return Array.from(this.#store.keys())
  }
}
