export type DictKey = string | symbol

export interface DictItem {
  label: string
  value: any // not sure if other data types exist
}

export class DictArray<D extends DictItem = DictItem> extends Array<D> {
  constructor(dicts: D[]) {
    super()

    // native loop, not Array.forEach
    for (let i = 0; i < dicts.length; i++) {
      const dict = dicts[i]
      this.push(dict)
    }
  }

  /**
   * Like `omit` in `lodash.js`
   * @param values
   * @returns DictArray
   */
  public omit(values: DictKey[]): DictArray<D> {
    return new DictArray<D>(this.filter(item => !values.includes(item.value)))
  }

  /**
   * Like `pick` in `lodash.js`
   * @param values
   * @returns DictArray
   */
  public pick(values: DictKey[]): DictArray<D> {
    return new DictArray<D>(this.filter(item => values.includes(item.value)))
  }

  /**
   * Get label by value.
   * @param value The value of dict item.
   * @returns The label of dict item.
   */
  public label(value: DictKey) {
    return this.item(value)?.label ?? ''
  }

  /**
   * Get dict item by value.
   * @param value The value of dict item.
   * @param defaultDict The default dict item.
   * @returns The dict item.
   */
  public item(value: DictKey, defaultDict?: D) {
    return this.find(item => item.value === value) ?? defaultDict
  }

  /**
   * Convert to plain array.
   * It will lost all methods of DictArray.
   * @returns Plain array.
   */
  public toPlainArray() {
    return Array.from(this)
  }
}
