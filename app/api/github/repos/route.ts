import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GitHubService } from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get GitHub OAuth token from Clerk
    try {
      const client = await clerkClient();

      // First, check what external accounts the user has
      const user = await client.users.getUser(userId);
      const githubAccount = user.externalAccounts?.find(
        (account) =>
          account.provider === "oauth_github" || account.provider === "github"
      );

      if (!githubAccount) {
        console.log("User external accounts:", user.externalAccounts);
        return NextResponse.json(
          {
            error:
              "GitHub account not connected. Please connect your GitHub account through your profile settings.",
          },
          { status: 404 }
        );
      }

      // Get OAuth token - use "github" without "oauth_" prefix (Clerk deprecation)
      const tokensResponse = await client.users.getUserOauthAccessToken(
        userId,
        "github"
      );

      if (
        !tokensResponse.data ||
        tokensResponse.data.length === 0 ||
        !tokensResponse.data[0].token
      ) {
        return NextResponse.json(
          {
            error:
              "GitHub access token not available. Please reconnect your GitHub account.",
          },
          { status: 404 }
        );
      }

      // Get repositories
      const githubService = new GitHubService(tokensResponse.data[0].token);
      const repos = await githubService.getRepositories();

      return NextResponse.json(repos);
    } catch (error: any) {
      console.error("Error fetching GitHub repos:", error);
      if (error.status === 404) {
        return NextResponse.json(
          {
            error:
              "GitHub account not connected. Please connect your GitHub account first.",
          },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
