import { describe, expect, test, vi } from 'vitest'
import { DictArray } from '../src/dict'
import { DictionaryStore } from '../src/store'
import { createDictionaryInstance } from '../src'

describe('DictArray', () => {
  test('constructor copies items into an array-like instance', () => {
    const arr = new DictArray([
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
    ])

    expect(arr).toBeInstanceOf(Array)
    expect(arr).toBeInstanceOf(DictArray)
    expect(arr).toHaveLength(2)
    expect(arr[0].label).toBe('A')
    expect(arr[1].value).toBe(2)
  })

  test('omit/pick filter by item.value and return DictArray', () => {
    const arr = new DictArray([
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
      { label: 'C', value: 3 },
    ])

    const omitted = arr.omit(['2'])
    const picked = arr.pick(['1', '3'])

    expect(omitted).toBeInstanceOf(DictArray)
    expect(picked).toBeInstanceOf(DictArray)
    expect(omitted.map(x => x.value)).toEqual([1, 3])
    expect(picked.map(x => x.value)).toEqual([1, 3])
  })

  test('item/label work and support default value', () => {
    const arr = new DictArray([
      { label: 'A', value: 1 },
      { label: 'B', value: 2 },
    ])

    expect(arr.item('1')?.label).toBe('A')
    expect(arr.label('2')).toBe('B')
    expect(arr.label('999')).toBe('')

    const fallback = { label: 'DEFAULT', value: 999 }
    expect(arr.item('999' as any, fallback)).toBe(fallback)
    expect(arr.item('999' as any, fallback)?.label).toBe('DEFAULT')
  })

  test('toPlainArray returns a native array', () => {
    const arr = new DictArray([{ label: 'A', value: 1 }])
    const plain = arr.toPlainArray()

    expect(Array.isArray(plain)).toBe(true)
    expect(plain).not.toBeInstanceOf(DictArray)
    expect((plain as any).omit).toBeUndefined()
  })
})

describe('DictionaryStore', () => {
  test('addRaw/get/delete/keys/size work', () => {
    const store = new DictionaryStore()

    expect(store.size()).toBe(0)
    const fallback = new DictArray([{ label: 'D', value: 0 }])
    expect(store.get('missing' as any, fallback)).toBe(fallback)

    store.addRaw('type' as any, [{ label: 'A', value: 1 }])

    expect(store.size()).toBe(1)
    expect(store.keys()).toEqual(['type'])
    expect(store.get('type' as any)).toBeInstanceOf(DictArray)
    expect(store.get('type' as any)?.label('1')).toBe('A')
    expect(store.store.value instanceof Map).toBe(true)

    store.delete('type' as any)
    expect(store.size()).toBe(0)
    expect(store.get('type' as any)).toBeUndefined()
  })

  test('addAll adds multiple dictionaries', () => {
    const store = new DictionaryStore()
    store.addAll({
      type: new DictArray([{ label: 'A', value: 1 }]),
      status: new DictArray([{ label: 'Enabled', value: 0 }]),
    } as any)

    expect(store.size()).toBe(2)
    expect(store.keys()).toEqual(['type', 'status'])
    expect(store.get('status' as any)?.label('0')).toBe('Enabled')
  })
})

describe('createDictionaryInstance', () => {
  test('getDictData loads missing dicts and tracks queue', async () => {
    const deferred: { promise: Promise<Record<string, any[]>>, resolve: (v: Record<string, any[]>) => void } = {} as any
    deferred.promise = new Promise((resolve) => {
      deferred.resolve = resolve
    })

    const load = vi.fn(() => deferred.promise)
    const instance = createDictionaryInstance({ load })

    const sym = Symbol('sym')
    const store = instance.getDictData(['type' as any, sym as any])

    expect(load).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledWith(['type'])
    expect(instance.queue.has('type' as any)).toBe(true)
    expect(instance.queue.has(sym as any)).toBe(true)

    deferred.resolve({ type: [{ label: 'A', value: 1 }] })
    await deferred.promise

    await Promise.resolve()
    await Promise.resolve()

    expect(instance.queue.size).toBe(0)
    expect(store.get('type' as any)?.label('1')).toBe('A')
  })

  test('getDictData dedupes requests by store and queue', async () => {
    const deferred: { promise: Promise<Record<string, any[]>>, resolve: (v: Record<string, any[]>) => void } = {} as any
    deferred.promise = new Promise((resolve) => {
      deferred.resolve = resolve
    })

    const load = vi.fn(() => deferred.promise)
    const instance = createDictionaryInstance({ load })

    instance.getDictData(['type' as any])
    instance.getDictData(['type' as any])

    expect(load).toHaveBeenCalledTimes(1)

    deferred.resolve({ type: [{ label: 'A', value: 1 }] })
    await deferred.promise
    await Promise.resolve()

    instance.getDictData(['type' as any])
    expect(load).toHaveBeenCalledTimes(1)
  })

  test('getDictData does not load when dicts empty', () => {
    const load = vi.fn(async () => ({}))
    const instance = createDictionaryInstance({ load })

    instance.getDictData()
    instance.getDictData([])

    expect(load).toHaveBeenCalledTimes(0)
  })

  test('reloadDictData loads when dicts provided', async () => {
    const load = vi.fn(async () => ({
      type: [{ label: 'A', value: 1 }],
    }))
    const instance = createDictionaryInstance({ load })

    await expect(instance.reloadDictData(['type' as any])).resolves.toEqual({
      type: [{ label: 'A', value: 1 }],
    })
    expect(load).toHaveBeenCalledTimes(1)
    expect(load).toHaveBeenCalledWith(['type'])
  })

  test('reloadDictData returns empty when dicts empty', async () => {
    const load = vi.fn(async () => ({}))
    const instance = createDictionaryInstance({ load })

    await expect(instance.reloadDictData([] as any)).resolves.toEqual({})
    expect(load).toHaveBeenCalledTimes(0)
  })
})
