export interface RegistryRule {
    id: string;
    name: string;
    description: string;
    techStack: string;
    tags: string[];
}
export interface RegistryRuleDetail {
    name: string;
    description: string;
    techStack: string;
    tags: string[];
    files: Array<{
        type: string;
        path: string;
        content: string;
    }>;
}
export declare function listRules(registryUrl: string, techStack?: string): Promise<RegistryRule[]>;
export declare function fetchRule(registryUrl: string, ruleId: string): Promise<RegistryRuleDetail | null>;
//# sourceMappingURL=registry.d.ts.map