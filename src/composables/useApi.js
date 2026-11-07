import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

import { useNotify } from '@/composables/useNotify'

/** Imperative operations share one mutation lifecycle; replaceable reads have their own owner. */
export function useApi(apiFn, options = {}) {
  const { notify } = useNotify()
  const queryClient = useQueryClient()
  const { silent = false, onSuccess = null, onError = null, invalidateKeys = [] } = options
  const mutationResult = useMutation({
    mutationFn: async (variables) => {
      const result = await apiFn(variables);
      return result;
    },
    onSuccess: (data) => {
      if (!silent) notify("تمت العملية بنجاح", "success");
      onSuccess?.(data);
      if (invalidateKeys.length) {
        invalidateKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        );
      }
    },
    onError: (error) => {
      // 409 conflict is already handled globally in apiClient interceptor
      if (!silent) {
        const msg =
          error?.response?.data?.error?.message ||
          error.message ||
          "حدث خطأ غير متوقع";
        notify(msg, "danger");
      }
      onError?.(error);
    },
  });

  return {
    data: computed(() => mutationResult.data.value),
    loading: computed(() => mutationResult.status.value === "pending"),
    error: computed(() => mutationResult.error.value),
    status: mutationResult.status,
    execute: mutationResult.mutateAsync,
    refresh: mutationResult.mutateAsync,
  };
}
