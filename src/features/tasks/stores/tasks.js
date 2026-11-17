// frontend/src/features/tasks/stores/tasks.js
import taskService from '@/features/tasks/services/taskService'
import { createCrudStore } from '@/stores/crudStoreFactory'
import { normalizeCursorResponse } from '@/utils/cursorResponse'

export const useTaskStore = createCrudStore('tasks', {
  fetchAll: (params) => taskService.getAll(params),
  fetchOne: undefined,
  create: (payload) => taskService.create(payload),
  update: undefined,
  remove: (id, version) => taskService.delete(id, version),
  listKey: 'tasks',

  extensions: {
    actions: {
      reset() {
        this.items = []
        this.current = null
        this.loading = false
        this.error = null
      },

      async createTask(payload) {
        const newItem = await this.create(payload)
        await this.fetchAll()
        return newItem
      },

      async fetchTasks({ cursor, limit, filters, sort } = {}) {
        const params = {
          ...filters,
        }

        if (limit) params.per_page = limit
        if (cursor) params.cursor = cursor

        if (sort) {
          params.sort_by = sort.sort_by
          params.sort_order = sort.sort_order
        }

        const result = await taskService.getAll(params)

        const { items, nextCursor, hasMore, total } = normalizeCursorResponse(
          result,
          { keys: ['items', 'tasks', 'results'] },
        )
        this.items = items
        return { data: items, nextCursor, hasMore, total }
      },

      async completeTask(id, version) {
        const result = await taskService.complete(id, version)

        const task = this.items.find((item) => item.id === id)

        if (task) {
          Object.assign(task, result?.data?.data ?? result?.data ?? result)
        }
      },

      async cancelTask(id, version, reason) {
        const result = await taskService.cancel(id, version, reason)

        const task = this.items.find((item) => item.id === id)

        if (task) {
          Object.assign(task, result?.data?.data ?? result?.data ?? result)
        }
      },

      async transitionTask(id, status, version, reason = '') {
        const result = await taskService.transition(id, status, version, reason)
        const updated = result?.data?.data ?? result?.data ?? result
        const task = this.items.find((item) => item.id === id)
        if (task && updated) Object.assign(task, updated)
        return updated
      },

      async deleteTask(id, version) {
        await this.remove(id, version)
      },

      async reorderTasks(orderList) {
        await taskService.reorder(orderList)
      },
    },
  },
})
