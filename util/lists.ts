import { Argv } from 'yargs'
type ListPreference = "tsv" | "json"

export const getListPreference = (argv: Argv): ListPreference => {
  if (argv.output) {
    return argv.output as ListPreference
  }

  return Bun.env['LIST_PREFERENCE'] as ListPreference ?? 'tsv'
}

export const outputList = (objects: any[], listPreference: ListPreference = 'tsv') => {
  switch(listPreference) {
    case 'tsv':
      // Find some way to output this in terminal-friendly manner
      outputTsv(objects)
      break
    case 'json':
      console.log(objects)
      break
    default:
      console.log('Not outputting anything, list preference not defined.')
  }
}

const outputTsv = (data: any, properties?: string[]) => {
  if (!Array.isArray(data)) {
      data = [data];
  }

  if (data.length < 1) {
    return
  }

 properties = properties
      ? properties
      : Object.keys(data[0]);

  const lines = [];
  let longestValues = properties.map(p => p?.length);

  lines.push(properties);

  for (const item of data) {
      const lineValues = [];
      for (const propIndex in properties) {
          const value = item[properties[propIndex]];
          const stringValue = `${value}`;

          if (longestValues[propIndex] < stringValue.length) {
              longestValues[propIndex] = stringValue.length;
          }

          lineValues.push(value);
      }

      lines.push(lineValues);
  }

  lines.forEach(lineValues => {
      let line = '';
      for (let i = 0; i < lineValues.length; i++) {
        if (lineValues[i] === undefined) {
          line += '';
          continue;
        }
        
        // if is last, then don't add padEnd
        if (i < lineValues.length - 1) {
            line += `${lineValues[i]}`.padEnd(longestValues[i] + 1);
        } else {
            if (typeof lineValues[i] === 'string') {
              line += lineValues[i]; // header row
            } 
            else {
              line += lineValues[i].lts ? 'LTS' : 'STS';
            }
        }
      }

      console.log(line);
  });
}