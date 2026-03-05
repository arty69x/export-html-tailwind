export type GeneratedCode = {
  html: string
  tsx: string
  tailwind: string
}

let store: GeneratedCode = {
  html: '',
  tsx: '',
  tailwind: '',
}

export function setCode(code: GeneratedCode) {
  store = code
}

export function getCode() {
  return store
}
