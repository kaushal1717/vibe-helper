export async function listRules(registryUrl, techStack) {
    const url = new URL(registryUrl);
    if (techStack) {
        url.searchParams.set("techStack", techStack);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error("Failed to fetch rules from registry");
    }
    return response.json();
}
export async function fetchRule(registryUrl, ruleId) {
    const url = `${registryUrl}/${ruleId}`;
    const response = await fetch(url);
    if (!response.ok) {
        return null;
    }
    return response.json();
}
