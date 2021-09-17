import { useCallback, useState } from "react"

export type TestStatus = 'waiting' | 'running' | 'finished' | 'error'

export type TestJob = {
    status: TestStatus
    text: string
    setStatus: (status: TestStatus) => void
    setText: (text: string) => void
    label: string
    refreshCode: number
    refresh: () => void
}

const useTestJob = (label: string): TestJob => {
    const [status, setStatus] = useState<TestStatus>('waiting')
    const [text, setText] = useState<string>('')
    const [refreshCode, setRefreshCode] = useState<number>(0)
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [setRefreshCode])

    return {status, text, setStatus, setText, label, refreshCode, refresh}
}

export default useTestJob