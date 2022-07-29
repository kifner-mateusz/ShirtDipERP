import axios from "axios"
import { useEffect } from "react"
import { useQuery } from "react-query"
import qs from "qs"

const fetchData = async <T = any,>(
  entryName?: string,
  page?: number,
  filterKeys?: string[],
  filterQuery?: string,
  sortOrder: "asc" | "desc" = "asc",
  pageSize: number = 10
) => {
  if (!entryName) return
  if (!page) return
  let query_obj: any = {
    pagination: {
      page,
      pageSize,
    },
    populate: "*",
    sort: ["updatedAt:" + sortOrder],
  }
  console.log(filterKeys, filterQuery)
  if (
    filterKeys &&
    filterKeys?.length > 0 &&
    filterQuery &&
    filterQuery.length > 0
  ) {
    let filters_or = []
    for (let key of filterKeys) {
      if (filterQuery && filterQuery.length > 0)
        filters_or.push({
          [key]: {
            $containsi: filterQuery,
          },
        })
    }
    console.log(filters_or)
    query_obj.filters = { $or: filters_or }
  }

  const query = qs.stringify(query_obj, {
    encodeValuesOnly: true,
  })
  console.log(query_obj, query)
  const res = await axios.get(`/${entryName}?${query}`)
  return res.data as { data: T; meta: any }
}

interface OptionsProps<EntryType> {
  pageSize?: number
  queryOptions?: {
    cacheTime?: number
    enabled?: boolean
    initialData?: any
    initialDataUpdatedAt?: any
    isDataEqual?: any
    keepPreviousData?: any
    meta?: any
    notifyOnChangeProps?: any
    notifyOnChangePropsExclusions?: any
    onError?: ((err: unknown) => void) | undefined
    onSettled?: ((data: any, error: unknown) => void) | undefined
    onSuccess?: ((data: any) => void) | undefined
    placeholderData?: any
    queryKeyHashFn?: any
    refetchInterval?: any
    refetchIntervalInBackground?: any
    refetchOnMount?: any
    refetchOnReconnect?: any
    refetchOnWindowFocus?: any
    retry?: any
    retryOnMount?: any
    retryDelay?: any
    select?: any
    staleTime?: any
    structuralSharing?: any
    suspense?: any
    useErrorBoundary?: any
  }
}

function useStrapiList<EntryType>(
  entryName: string,
  page: number,
  filterKeys?: string[],
  filterQuery?: string,
  sortOrder: "asc" | "desc" = "asc",
  options: OptionsProps<EntryType> = {}
) {
  const pageSize = options?.pageSize ?? 10
  const { data, status, refetch, isLoading } = useQuery(
    [entryName, page, filterKeys, filterQuery, sortOrder, pageSize],
    () =>
      fetchData(entryName, page, filterKeys, filterQuery, sortOrder, pageSize),
    { ...options?.queryOptions }
  )

  useEffect(() => {
    refetch()
  }, [page, pageSize])
  return {
    data: data && "data" in data ? data?.data : data,
    meta: data?.meta,
    status,
    refetch,
  }
}

export default useStrapiList
