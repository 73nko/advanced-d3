export const useAccessor = (accessor, d, i) => (
  typeof accessor == "function" ? accessor(d, i) : accessor
)

let lastId = 0
export const getUniqueId = (prefix="") => {
  lastId++
  return [prefix, lastId].join("-")
}
