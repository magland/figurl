type RoutePath = '/home' | '/about' | '/fig' | '/status' | '/compose'
export const isRoutePath = (x: string): x is RoutePath => {
    if (['/home', '/about', '/fig', '/status', '/compose'].includes(x)) return true
    return false
}

export default RoutePath