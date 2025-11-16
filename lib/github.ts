import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  // Get user's repositories (with pagination to fetch all)
  async getRepositories() {
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForAuthenticatedUser,
      {
        per_page: 100,
        sort: "updated",
      }
    );
    return repos;
  }

  // Get default branch of a repository
  async getDefaultBranch(owner: string, repo: string) {
    const { data } = await this.octokit.repos.get({
      owner,
      repo,
    });
    return data.default_branch;
  }

  // Create a new branch from default branch
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    defaultBranch: string
  ) {
    // Check if branch already exists
    try {
      await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${branchName}`,
      });
      // Branch exists, throw error
      throw new Error(`Branch ${branchName} already exists`);
    } catch (error: any) {
      // If error is 404, branch doesn't exist, which is what we want
      if (error.status !== 404) {
        throw error;
      }
    }

    // Get the SHA of the default branch
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    // Create new branch
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });
  }

  // Create or update a file in .cursor/rules/ directory
  async createOrUpdateRuleFile(
    owner: string,
    repo: string,
    branch: string,
    fileName: string,
    content: string,
    message: string
  ) {
    const filePath = `.cursor/rules/${fileName}`;

    // Check if file exists
    let sha: string | undefined;
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });
      if (Array.isArray(data)) {
        throw new Error("Path is a directory");
      }
      sha = data.sha;
    } catch (error: any) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Encode content to base64
    const encodedContent = Buffer.from(content).toString("base64");

    // Create or update file
    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message,
      content: encodedContent,
      branch,
      sha,
    });
  }

  // Create pull request
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ) {
    const { data } = await this.octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });
    return data;
  }

  // Complete flow: Create branch, add file to .cursor/rules/, create PR
  async createPRWithCursorRules(
    owner: string,
    repo: string,
    ruleContent: string,
    ruleTitle: string,
    ruleId: string,
    fileName: string
  ) {
    // 1. Get default branch
    const defaultBranch = await this.getDefaultBranch(owner, repo);

    // 2. Create branch name with timestamp to avoid conflicts
    const timestamp = Date.now().toString(36);
    const branchName = `add-cursor-rules-${ruleId.slice(0, 8)}-${timestamp}`;

    // 3. Create branch
    try {
      await this.createBranch(owner, repo, branchName, defaultBranch);
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(
          `Repository ${owner}/${repo} not found or you don't have access to it.`
        );
      }
      throw error;
    }

    // 4. Create or update .cursor/rules/{fileName} file
    await this.createOrUpdateRuleFile(
      owner,
      repo,
      branchName,
      fileName,
      ruleContent,
      `Add cursor rules: ${ruleTitle}`
    );

    // 5. Create PR
    const pr = await this.createPullRequest(
      owner,
      repo,
      `Add cursor rules: ${ruleTitle}`,
      `This PR adds cursor rules to the repository.\n\n**Rule:** ${ruleTitle}\n**Location:** \`.cursor/rules/${fileName}\`\n\nAdded via [Vibe Helper](${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      })`,
      branchName,
      defaultBranch
    );

    return pr;
  }
}
