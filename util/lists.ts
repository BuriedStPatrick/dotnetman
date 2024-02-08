import { Argv } from 'yargs'
type ListPreference = "tsv" | "json"

export const getListPreference = (argv: Argv): ListPreference => {
  if (argv.output) {
    return argv.output as ListPreference
  }

  return process.env['LIST_PREFERENCE'] as ListPreference ?? 'tsv'
}

export const outputList = (objects: any[], listPreference: ListPreference = 'tsv') => {
  switch(listPreference) {
    case 'tsv':
      // Find some way to output this in terminal-friendly manner
      console.log('tsv output not yet supported')
      break
    case 'json':
      console.log(objects)
      break
    default:
      console.log('Not outputting anything, list preference not defined.')
  }
}