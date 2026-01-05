<template>
  <div class="app-container">
    <h1 class="app-title">vue-cacheable-dictionary</h1>
    <div class="app-content">
      <div class="groups">
        <section v-for="(item, index) in dictKeys" :key="index" class="group">
          <div class="group-title">{{ item }}</div>
          <div class="table-wrap">
            <table class="dict-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Value</th>
                  <th>Color (Optional)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dictItem, dIndex) in (dict.get(item) ?? [])" :key="dIndex">
                  <td class="cell-label">{{ dictItem.label }}</td>
                  <td class="cell-mono">
                    <span>{{ dictItem.value }}</span>
                    <span class="type-tag">{{ getValueType(dictItem.value) }}</span>
                  </td>
                  <td class="cell-mono">{{ dictItem.color ?? '--' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDict } from './composables/dictionary'

const dictKeys = ['type', 'status', 'order_type']

const dict = useDict(dictKeys)

const getValueType = (value: unknown) => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

console.log(dict)
</script>

<style scoped>
.app-container {
  width: 100%;
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.app-content {
  display: flex;
  justify-content: center;
}

.empty {
  opacity: 0.7;
  padding: 24px 0;
}

.groups {
  width: min(880px, 100%);
  display: grid;
  gap: 14px;
}

.group {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.group-title {
  font-weight: 700;
  margin-bottom: 10px;
  text-transform: none;
}

.table-wrap {
  overflow: auto;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.dict-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #f2f2f2;
  color: #213547;
}

.dict-table th,
.dict-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #d0d0d0;
  text-align: left;
  white-space: nowrap;
}

.dict-table th {
  position: sticky;
  top: 0;
  background: #e7e7e7;
  font-weight: 700;
}

.dict-table tbody tr:last-child td {
  border-bottom: none;
}

.cell-label {
  font-weight: 600;
}

.cell-mono {
  opacity: 0.85;
  font-variant-numeric: tabular-nums;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin-left: 8px;
  border-radius: 999px;
  background: #e7e7e7;
  border: 1px solid #d0d0d0;
  opacity: 0.9;
  font-size: 12px;
  line-height: 1.2;
  cursor: default;
}
</style>
