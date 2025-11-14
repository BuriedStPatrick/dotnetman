import { isArray, isEmpty, isObject, isString } from 'lodash'
import * as pointer from 'json-pointer'
const { dump } = await import('js-yaml')

const outputRaw = (data: any) => {
  if (isString(data)) {
    console.dir(data)

    return
  }

  if (isArray(data)) {
    for (const item of data as any[]) {
      console.dir(item)
    }

    return
  }

  if (isObject(data)) {
    for (const key of Object.keys(data)) {
      const value = (data as any)[key]

      if (isObject(value)) {
        // We won't bother recursively going through the object
        continue
      }

      console.dir(value.toString())
    }
  }
}

const outputJson = (data: any) => {
  console.dir(JSON.stringify(data))
}

const outputYaml = (data: any) => {
  const yaml = dump(data)
  console.dir(yaml)
}

const outputTable = (data: any) => {
  console.table(data)
}

export type PropertyPath = string

export type PropertyOptions = {
  paths?: PropertyPath[]
  excludeEmptyObjects?: boolean
}

export const output = (
  data: any,
  outputFormat?: OutputFormat,
  propertyOptions?: PropertyOptions): void => {
  if (isString(data)) {
    outputRaw(data)

    return
  }

  if (propertyOptions?.paths !== undefined) {
    const _isArray = isArray(data)
    data = _isArray
      ? (data as any[]).map(x => pickPaths(x, propertyOptions!.paths!))
      : pickPaths(data, propertyOptions!.paths!)

    if (propertyOptions.excludeEmptyObjects === true) {
      data = _isArray
        ? (data as any[]).filter(x => !isEmpty(x))
        : isEmpty(data) ? null : data
    }
  }

  switch (outputFormat) {
    case 'json':
      outputJson(data)
      break
    case 'table':
      outputTable(data)
      break
    case 'yaml':
      outputYaml(data)
      break
    case 'raw':
      outputRaw(data)
      break
    default:
      outputJson(data)
      break
  }
}

const pickPaths = (obj: any, paths: string[]): any => {
  const result = {} as any

  for (const path of paths) {
    try {
      const value = pointer.get(obj, path)
      const pathSplit = path.split('/')

      pointer.set(result, `/${pathSplit[pathSplit.length - 1]}`, value)
    } catch {
      continue
    }
  }

  return result
}

/**
 * CLI minimum output logging level (from noisy to quiet).
 * RFC: https://datatracker.ietf.org/doc/html/rfc5424
 *
 * @export
 * @typedef {OutputLevel}
 */
export type OutputLevel =
  'emerg'
  | 'alert'
  | 'crit'
  | 'error'
  | 'warning'
  | 'notice'
  | 'info'
  | 'debug'

/**
 * CLI output format.
 * 'json' is ideal for programmatic use.
 * 'table' is ideal for interactive use.
 * 'raw' is ideal for piping. Flattens the output, does not recursely navigate objects.
 * 'yaml' is ideal for readability.
 *
 * @export
 * @typedef {OutputFormat}
 */
export type OutputFormat = 'json' | 'table' | 'yaml' | 'raw'

/**
 * CLI output settings.
 *
 * @export
 * @typedef {OutputSettings}
 */
export type OutputSettings = {
  /**
   * The default minimum output level.
   *
   * @type {OutputFormat}
   */
  level: OutputLevel
  /**
   * The default output format.
   *
   * @type {OutputFormat}
   */
  format: OutputFormat
  /**
   * Error log file path
   *
   * @type {string}
   */
  errorLogFile: string
}

export type OutputArgs = {
  property?: string[]
  output?: OutputFormat
  ['exclude-empty']?: boolean
}

export function toPropertyOptions(outputArgs: OutputArgs): PropertyOptions {
  return {
    excludeEmptyObjects: outputArgs["exclude-empty"],
    paths: outputArgs.property
  } as PropertyOptions
}