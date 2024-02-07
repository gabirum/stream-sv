export const getPagination = (
  { page, perPage }: Record<string, unknown>,
  [defaultPage, defaultPerPage]: [number, number] = [1, 25]
): [number, number] => {
  const pageNum = page ? Number(page) : defaultPage
  const perPageNum = perPage ? Number(perPage) : defaultPerPage

  return [pageNum, perPageNum]
}
