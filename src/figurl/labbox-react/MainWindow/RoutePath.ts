type RoutePath = '/home' | '/about' | '/fig' | '/status' | '/doc' | '/f'
export const isRoutePath = (x: string): x is RoutePath => {
    if (['/home', '/about', '/fig', '/status', '/doc', '/f'].includes(x)) return true
    return false
}

export default RoutePath