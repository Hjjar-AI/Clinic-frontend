// frontend/src/composables/useApi.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, watch } from "vue";

import { useNotify } from "@/composables/useNotify";

/**
 * Unified API composable for data fetching (GET) and mutations (POST/PUT/DELETE).
 * Uses Vue Query under the hood.
 *
 * Default mode is `mutation: true`. Historically this composable was used
 * everywhere as an imperative "call this function" — all call sites call
 * `execute()` — and the query default caused anonymous functions to share a
 * single cache key `['query', {}]` across every instance in the app. That
 * collapses unrelated operations into one Vue Query entry.
 *
 * Query mode is opt-in: pass `{ mutation: false }` AND provide either a named
 * function or an explicit `queryKey`. This composable throws if it cannot
 * derive a stable key, because silently aliasing distinct reads under the
 * same key is how the original bug manifested.
 */
export function useApi(apiFn, options = {}) {
  const { notify } = useNotify();
  const queryClient = useQueryClient();

  const {
    immediate = false,
    pollingInterval = 0,
    staleTime = undefined,
    silent = false,
    onSuccess = null,
    onError = null,
    initialData = null,
    mutation = true,
    invalidateKeys = [],
    queryKey: explicitQueryKey = null,
    queryKeyParams = null,
  } = options;

  if (mutation) {
    const mutationResult = useMutation({
      mutationFn: async (...args) => {
        const result = await apiFn(...args);
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

  // Query mode — derive a stable, non-aliasing cache key. Either the
  // caller supplies an explicit `queryKey`, or the function has a name we
  // can use as a discriminator. Anonymous + no key is rejected outright.
  const inferredKey = apiFn.name
    ? [apiFn.name, queryKeyParams || {}]
    : null;
  const queryKey = explicitQueryKey ?? inferredKey;

  if (!queryKey) {
    throw new Error(
      "useApi: query mode requires either an explicit `queryKey` option or " +
        "a named function. Anonymous functions would share a single cache " +
        "entry and collapse unrelated queries into one.",
    );
  }

  const queryResult = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const result = await apiFn({ signal });
      return result;
    },
    enabled: immediate,
    refetchInterval: pollingInterval || false,
    initialData: initialData,
    staleTime,
  });

  // Vue Query v5 removed `onSuccess` / `onError` from `useQuery`'s options.
  // Re-implement them with watchers so the option surface stays the same
  // for callers regardless of which version of Vue Query they're on.
  watch(queryResult.error, (newError) => {
    if (!newError) return;
    if (!silent) {
      const msg = newError?.message || "حدث خطأ غير متوقع";
      notify(msg, "danger");
    }
    onError?.(newError);
  });

  if (onSuccess) {
    watch(queryResult.data, (newData, oldData) => {
      if (newData !== undefined && newData !== oldData) {
        onSuccess(newData);
      }
    });
  }

  return {
    data: computed(() => queryResult.data.value),
    loading: computed(() => queryResult.isLoading.value),
    error: computed(() => queryResult.error.value),
    status: computed(() => queryResult.status.value),
    execute: async () => {
      await queryResult.refetch();
    },
    refresh: queryResult.refetch,
  };
}
