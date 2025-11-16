export interface RegistryRule {
  id: string
  name: string
  description: string
  techStack: string
  tags: string[]
}

export interface RegistryRuleDetail {
  name: string
  description: string
  techStack: string
  tags: string[]
  files: Array<{
    type: string
    path: string
    content: string
  }>
}

export async function listRules(
  registryUrl: string,
  techStack?: string
): Promise<RegistryRule[]> {
  const url = new URL(registryUrl)
  if (techStack) {
    url.searchParams.set("techStack", techStack)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error("Failed to fetch rules from registry")
  }

  return response.json() as Promise<RegistryRule[]>
}

export async function fetchRule(
  registryUrl: string,
  ruleId: string
): Promise<RegistryRuleDetail | null> {
  const url = `${registryUrl}/${ruleId}`

  const response = await fetch(url)
  if (!response.ok) {
    return null
  }

  return response.json() as Promise<RegistryRuleDetail>
}

