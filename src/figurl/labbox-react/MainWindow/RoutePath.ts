type RoutePath = '/home' | '/about' | '/fig' | '/status'
export const isRoutePath = (x: string): x is RoutePath => {
    if (['/home', '/about', '/fig', '/status'].includes(x)) return true
    return false
}

export default RoutePath