const uniqueSorted = <T>(a: T[]): T[] => {
    const x = [...new Set(a)]
    x.sort()
    return x
}

export default uniqueSorted