type RoutePath = '/home' | '/about' | '/fig' | '/status' | '/doc'
export const isRoutePath = (x: string): x is RoutePath => {
    if (['/home', '/about', '/fig', '/status', '/doc'].includes(x)) return true
    return false
}

export default RoutePath