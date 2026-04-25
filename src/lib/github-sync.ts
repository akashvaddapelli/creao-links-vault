/**
 * GitHub integration for syncing links to a GitHub repository
 * Uses GitHub's REST API to create/update a JSON file with all links
 */

import { type LinkModel } from "./local-storage";

export interface GitHubConfig {
	token: string;
	owner: string;
	repo: string;
	branch?: string;
	filePath?: string;
}

const DEFAULT_BRANCH = "main";
const DEFAULT_FILE_PATH = "links-backup.json";

/**
 * Get the current content of the links file from GitHub
 */
async function getFileContent(config: GitHubConfig): Promise<{ content: string; sha: string } | null> {
	const { token, owner, repo, branch = DEFAULT_BRANCH, filePath = DEFAULT_FILE_PATH } = config;

	try {
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/vnd.github.v3+json",
				},
			},
		);

		if (response.status === 404) {
			return null; // File doesn't exist yet
		}

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to fetch file from GitHub");
		}

		const data = await response.json();
		return {
			content: atob(data.content), // Decode base64
			sha: data.sha,
		};
	} catch (error) {
		console.error("Error fetching from GitHub:", error);
		throw error;
	}
}

/**
 * Create or update the links file on GitHub
 */
export async function syncToGitHub(links: LinkModel[], config: GitHubConfig): Promise<void> {
	const { token, owner, repo, branch = DEFAULT_BRANCH, filePath = DEFAULT_FILE_PATH } = config;

	try {
		// Get current file (if exists) to get its SHA
		const existing = await getFileContent(config);

		// Prepare the content
		const content = JSON.stringify(
			{
				links,
				lastSync: new Date().toISOString(),
				totalLinks: links.length,
			},
			null,
			2,
		);

		// Create or update the file
		const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github.v3+json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message: existing
					? `Update links backup - ${links.length} links`
					: `Create links backup - ${links.length} links`,
				content: btoa(content), // Encode to base64
				branch,
				...(existing ? { sha: existing.sha } : {}),
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to sync to GitHub");
		}
	} catch (error) {
		console.error("Error syncing to GitHub:", error);
		throw error;
	}
}

/**
 * Restore links from GitHub backup
 */
export async function restoreFromGitHub(config: GitHubConfig): Promise<LinkModel[]> {
	try {
		const file = await getFileContent(config);
		if (!file) {
			throw new Error("No backup found on GitHub");
		}

		const data = JSON.parse(file.content);
		return data.links as LinkModel[];
	} catch (error) {
		console.error("Error restoring from GitHub:", error);
		throw error;
	}
}

/**
 * Verify GitHub token and repository access
 */
export async function verifyGitHubAccess(config: GitHubConfig): Promise<boolean> {
	const { token, owner, repo } = config;

	try {
		const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github.v3+json",
			},
		});

		return response.ok;
	} catch {
		return false;
	}
}

/**
 * Get GitHub configuration from localStorage
 */
export function getGitHubConfig(): GitHubConfig | null {
	try {
		const raw = localStorage.getItem("github_config");
		if (!raw) return null;
		return JSON.parse(raw) as GitHubConfig;
	} catch {
		return null;
	}
}

/**
 * Save GitHub configuration to localStorage
 */
export function saveGitHubConfig(config: GitHubConfig): void {
	localStorage.setItem("github_config", JSON.stringify(config));
}

/**
 * Clear GitHub configuration from localStorage
 */
export function clearGitHubConfig(): void {
	localStorage.removeItem("github_config");
}
