type RoutePath = '/home' | '/about' | '/status' | '/doc' | '/f'
export const isRoutePath = (x: string): x is RoutePath => {
    if (['/home', '/about', '/status', '/doc', '/f'].includes(x)) return true
    return false
}

export default RoutePath