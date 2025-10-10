import { ChangeEvent } from 'react'

export async function readFileAsText(file: File): Promise<string> {
  return await file.text()
}

export function createFileInputHandler(
  onSuccess: (text: string) => void,
  onError: (error: unknown) => void
) {
  return async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await readFileAsText(file)
      onSuccess(text)
    } catch (error) {
      onError(error)
    }
  }
}

export async function fetchDemoFile(): Promise<string> {
  const response = await fetch('/sample.xml')
  if (!response.ok) {
    throw new Error('Failed to load demo file')
  }
  return await response.text()
}
