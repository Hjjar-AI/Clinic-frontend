export function optionList(response) {
  const payload = response?.data?.data ?? response?.data ?? response
  if (Array.isArray(payload)) return payload
  for (const key of ['items','results','patients','visits','users','doctors','diagnoses','medications','scales','templates']) if (Array.isArray(payload?.[key])) return payload[key]
  throw new Error('Invalid options response')
}
