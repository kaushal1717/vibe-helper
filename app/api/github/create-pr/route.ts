import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { GitHubService } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { owner, repo, ruleId, ruleContent, ruleTitle, fileName } =
      await req.json();

    if (!owner || !repo || !ruleId || !ruleContent || !ruleTitle || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate filename (ensure it has .mdc extension and is safe)
    if (!fileName.endsWith(".mdc")) {
      return NextResponse.json(
        { error: "Filename must end with .mdc" },
        { status: 400 }
      );
    }

    // Sanitize filename (remove any path traversal attempts)
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .replace(/\.\./g, "");
    if (sanitizedFileName !== fileName) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
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

      // Create PR
      const githubService = new GitHubService(tokensResponse.data[0].token);
      const pr = await githubService.createPRWithCursorRules(
        owner,
        repo,
        ruleContent,
        ruleTitle,
        ruleId,
        sanitizedFileName
      );

      return NextResponse.json({
        success: true,
        prUrl: pr.html_url,
        prNumber: pr.number,
      });
    } catch (error: any) {
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
    console.error("Error creating PR:", error);

    // Handle specific errors
    if (error.status === 422) {
      return NextResponse.json(
        { error: "Branch already exists. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create PR" },
      { status: 500 }
    );
  }
}
