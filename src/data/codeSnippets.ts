export const EASY_CODE_SNIPPETS = [
  "const sum = (a, b) => a + b;",
  "let score = 0;\nscore += 10;\nconsole.log(score);",
  "function greet(name) {\n  return 'Hello, ' + name;\n}",
  "const fruits = ['apple', 'banana', 'orange'];\nfruits.forEach(f => console.log(f));",
];

export const MEDIUM_CODE_SNIPPETS = [
  "async function fetchData(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('HTTP error');\n  return res.json();\n}",
  "const filterNumbers = (arr, threshold) => {\n  return arr.filter(num => num > threshold);\n};",
  "interface UserProfile {\n  id: string;\n  name: string;\n  isActive: boolean;\n  scores: number[];\n}",
  "useEffect(() => {\n  const timer = setInterval(() => tick(), 1000);\n  return () => clearInterval(timer);\n}, []);",
];

export const HARD_CODE_SNIPPETS = [
  "export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {\n  let timeoutId: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn(...args), delay);\n  };\n}",
  "class BinarySearchTree<T> {\n  root: Node<T> | null = null;\n  insert(value: T): void {\n    const newNode = new Node(value);\n    if (!this.root) { this.root = newNode; return; }\n    this.insertNode(this.root, newNode);\n  }\n}",
  "const memoize = <T extends (...args: any[]) => any>(fn: T) => {\n  const cache = new Map<string, ReturnType<T>>();\n  return (...args: Parameters<T>): ReturnType<T> => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key)!;\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n};",
];
