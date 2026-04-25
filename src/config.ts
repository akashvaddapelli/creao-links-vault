// Application Configuration
// This file centralizes all configurable values for easy customization

export const APP_CONFIG = {
	// Authentication
	password: import.meta.env.VITE_APP_PASSWORD || "pass.word.admin.mode",

	// User Information
	userName: import.meta.env.VITE_USER_NAME || "Akash Vaddapelli",

	// UI Text
	welcomeMessage: "Welcome Back",
	tagline: "All your links are safe and secured...Here!",

	// Page Meta
	pageTitle: "Link Manager - Personal Link Organization",
	pageDescription:
		"Personal link management application to store, organize, and manage all your important URLs with custom names",
} as const;
