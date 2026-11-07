// frontend/src/features/tasks/stores/tasks.js
import taskService from '@/features/tasks/services/taskService'
import { createCrudStore } from '@/stores/crudStoreFactory'

export const useTaskStore = createCrudStore('tasks', {
  fetchAll: (params) => taskService.getAll(params),
  fetchOne: undefined,
  create: (payload) => taskService.create(payload),
  update: undefined,
  remove: (id) => taskService.delete(id),
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

        const payload = result?.data?.data ?? result?.data ?? result

        let list = []

        if (Array.isArray(payload)) {
          list = payload
        } else if (payload && typeof payload === 'object') {
          list = payload.items || payload.results || []
        }

        const meta =
          (!Array.isArray(payload) && payload?.meta) ||
          result?.meta ||
          result?.data?.meta ||
          {}

        this.items = list

        return {
          data: list,
          nextCursor: meta.next_cursor || null,
          hasMore: meta.has_more ?? Boolean(meta.next_cursor),
          total: meta.total,
        }
      },

      async completeTask(id, version) {
        const result = await taskService.complete(id, version)

        const task = this.items.find((item) => item.id === id)

        if (task) {
          Object.assign(task, result?.data?.data ?? result?.data ?? result)
        }
      },

      async cancelTask(id, version, reason) {
        await taskService.cancel(id, version, reason)

        const task = this.items.find((item) => item.id === id)

        if (task) {
          task.status = 'cancelled'
          task.cancelled_at = new Date().toISOString()
        }
      },

      async transitionTask(id, status, version, reason = '') {
        const result = await taskService.transition(id, status, version, reason)
        const updated = result?.data?.data ?? result?.data ?? result
        const task = this.items.find((item) => item.id === id)
        if (task && updated) Object.assign(task, updated)
        return updated
      },

      async deleteTask(id) {
        await this.remove(id)
      },

      async reorderTasks(orderList) {
        await taskService.reorder(orderList)
      },
    },
  },
})
