const baseUrl = 'https://endoflife.date'

export type DotnetLifeCycle = {
  cycle: string,
  releaseDate: Date,
  lts: boolean,
  eol: Date,
  latest: string,
  latestReleaseDate: Date
}

export const getDotnetLifeCycles = async(): Promise<DotnetLifeCycle[]> => {
  const response = await fetch(`${baseUrl}/api/dotnet.json`)

  return (await response.json()) as DotnetLifeCycle[]
}