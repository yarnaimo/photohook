export function toChunks<T>(arr: T[], size: number) {
    return arr.reduce(
        (newarr, _, i) => (i % size === 0 ? [...newarr, arr.slice(i, i + size)] : newarr),
        [] as T[][]
    )
}
