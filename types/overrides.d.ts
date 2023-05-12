interface ObjectConstructor {
  keys<K extends string | keyof T = string, T = object>(o: T): Array<K>
}
