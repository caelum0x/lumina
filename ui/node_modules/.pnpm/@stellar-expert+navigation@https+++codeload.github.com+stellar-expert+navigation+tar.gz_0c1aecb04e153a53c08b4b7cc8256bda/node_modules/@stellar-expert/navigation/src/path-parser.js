export function parsePath(path) {
    let pathname = path || '/'

    function extract(separator) {
        const index = pathname.indexOf(separator)

        if (index === -1) return ''
        pathname = pathname.substring(0, pathname.length - index)
        const res = pathname.substring(index)
        return res.length > 1 ? res : ''
    }

    return {
        hash: extract('#'),
        search: extract('?'),
        pathname
    }
}