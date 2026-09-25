import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
	PlusIcon,
	Edit2Icon,
	Trash2Icon,
	ExternalLinkIcon,
	CopyIcon,
	LinkIcon,
	MailIcon,
	GithubIcon,
	UploadIcon,
	DownloadIcon,
	CheckCircle2Icon,
	XCircleIcon,
	SendIcon,
} from "lucide-react";
import { localLinkStore, type LinkModel } from "@/lib/local-storage";
import { APP_CONFIG } from "@/config";
import {
	syncToGitHub,
	restoreFromGitHub,
	verifyGitHubAccess,
	getGitHubConfig,
	saveGitHubConfig,
	clearGitHubConfig,
	type GitHubConfig,
} from "@/lib/github-sync";
import {
	isAllowedEmail,
	createMagicToken,
	verifyMagicToken,
	sendMagicLinkEmail,
	clearMagicToken,
} from "@/lib/magic-link";
import { visitorLog } from "@/lib/visitor-log";

export const Route = createFileRoute("/")({
	component: App,
});

// ─── Gamified Reward Screen ───────────────────────────────────────────────────
// Shown after any email is submitted (authorized or not).
// Replaces the fake error screen with a fun XP / badge unlock celebration.

const BADGES = [
	{ icon: "🔐", label: "Vault Seeker", color: "from-violet-600 to-indigo-600" },
	{ icon: "🕵️", label: "Shadow Agent", color: "from-slate-700 to-slate-900" },
	{ icon: "⚡", label: "First Contact", color: "from-yellow-500 to-orange-500" },
];

function pickBadge(email: string) {
	// Deterministic badge based on email so the same person always gets the same badge
	const sum = email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return BADGES[sum % BADGES.length];
}

function XpBar({ xp, max }: { xp: number; max: number }) {
	const pct = Math.min(100, Math.round((xp / max) * 100));
	return (
		<div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
			<div
				className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

function Particle({ style }: { style: React.CSSProperties }) {
	return (
		<span
			className="absolute w-2 h-2 rounded-full opacity-0 animate-[particle_1.2s_ease-out_forwards]"
			style={style}
		/>
	);
}

function RewardScreen({ email, onRetry }: { email: string; onRetry: () => void }) {
	const badge = pickBadge(email);
	const xp = 250 + (email.length * 7);
	const [showXp, setShowXp] = useState(false);
	const [showBadge, setShowBadge] = useState(false);
	const [particles] = useState(() =>
		Array.from({ length: 18 }, (_, i) => ({
			id: i,
			color: ["#4ade80", "#facc15", "#818cf8", "#f472b6", "#38bdf8"][i % 5],
			x: Math.random() * 100,
			delay: Math.random() * 0.6,
			size: 6 + Math.random() * 8,
		}))
	);

	useEffect(() => {
		const t1 = setTimeout(() => setShowBadge(true), 300);
		const t2 = setTimeout(() => setShowXp(true), 800);
		return () => { clearTimeout(t1); clearTimeout(t2); };
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-green-950 to-black flex items-center justify-center px-4">
			{/* Particle burst */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				{particles.map((p) => (
					<Particle
						key={p.id}
						style={{
							left: `${p.x}%`,
							top: "50%",
							width: p.size,
							height: p.size,
							backgroundColor: p.color,
							animationDelay: `${p.delay}s`,
							transform: `translateY(-${40 + Math.random() * 200}px)`,
						}}
					/>
				))}
			</div>

			<Card className="w-full max-w-md bg-black border-0 shadow-2xl shadow-green-900/50 relative overflow-hidden">
				{/* Glow ring */}
				<div className="absolute inset-0 rounded-xl pointer-events-none" />

				<CardHeader className="text-center pb-2 pt-8">
					{/* Badge unlock animation */}
					<div
						className={`flex justify-center mb-4 transition-all duration-700 ${
							showBadge ? "opacity-100 scale-100" : "opacity-0 scale-50"
						}`}
					>
						<div className={`bg-gradient-to-br ${badge.color} p-5 rounded-2xl shadow-lg shadow-green-900/60`}>
							<span className="text-4xl" role="img" aria-label={badge.label}>{badge.icon}</span>
						</div>
					</div>

					<div className={`transition-all duration-500 delay-300 ${showBadge ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
						<p className="text-xs font-mono text-green-500 tracking-widest uppercase mb-1">Badge Unlocked</p>
						<CardTitle className="text-2xl font-bold text-green-400">{badge.label}</CardTitle>
					</div>
				</CardHeader>

				<CardContent className="space-y-5 pb-8">
					{/* XP reward */}
					<div className={`transition-all duration-700 ${showXp ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<div className="flex justify-between items-center mb-2">
							<span className="text-xs font-mono text-green-600 uppercase tracking-wider">XP Earned</span>
							<span className="text-lg font-bold text-yellow-400 font-mono">+{xp} XP</span>
						</div>
						<XpBar xp={showXp ? xp : 0} max={1000} />
						<p className="text-right text-xs text-green-700 mt-1 font-mono">{xp} / 1000 to next rank</p>
					</div>

					{/* Stats row */}
					<div className={`grid grid-cols-3 gap-2 transition-all duration-700 delay-200 ${showXp ? "opacity-100" : "opacity-0"}`}>
						{[
							{ label: "Rank", value: "Initiate" },
							{ label: "Streak", value: "1 day" },
							{ label: "Score", value: `${xp * 4}` },
						].map((stat) => (
							<div key={stat.label} className="bg-green-950/40 rounded-lg p-2 text-center">
								<p className="text-xs text-green-600 font-mono uppercase">{stat.label}</p>
								<p className="text-sm font-bold text-green-300 font-mono">{stat.value}</p>
							</div>
						))}
					</div>

					{/* Message */}
					<div className={`bg-green-950/30 rounded-lg px-4 py-3 transition-all duration-700 delay-300 ${showXp ? "opacity-100" : "opacity-0"}`}>
						<p className="text-green-400 text-sm text-center font-mono leading-relaxed">
							0O0ps! page Broken
						</p>
					</div>

					{/* Retry / back button */}
					<button
						type="button"
						onClick={onRetry}
						className={`w-full bg-green-900/40 hover:bg-green-800/60 text-green-400 text-xs font-mono py-2 rounded tracking-widest uppercase transition-all duration-700 delay-500 ${showXp ? "opacity-100" : "opacity-0"}`}
					>
						↩ Try a different email
					</button>
				</CardContent>
			</Card>

			<style>{`
				@keyframes particle {
					0%   { opacity: 1; transform: translateY(0) scale(1); }
					100% { opacity: 0; transform: translateY(-180px) scale(0.3); }
				}
			`}</style>
		</div>
	);
}

// Helper function to get icon element based on link name
function getIconForLink(name: string): ReactNode {
	const lowerName = name.toLowerCase();

	// YouTube
	if (lowerName.includes("youtube")) {
		return (
			<svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path
					fill="#FF0000"
					d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
				/>
			</svg>
		);
	}

	// GitHub
	if (lowerName.includes("github")) {
		return (
			<svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path
					fill="#181717"
					d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
				/>
			</svg>
		);
	}

	// Twitter/X
	if (lowerName.includes("twitter") || lowerName.includes("x.com")) {
		return (
			<svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path
					fill="#1DA1F2"
					d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
				/>
			</svg>
		);
	}

	// Instagram
	if (lowerName.includes("instagram") || lowerName.includes("insta")) {
		return (
			<svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path
					fill="#E4405F"
					d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"
				/>
			</svg>
		);
	}

	// LinkedIn
	if (lowerName.includes("linkedin")) {
		return (
			<svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path
					fill="#0A66C2"
					d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 23.2 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
				/>
			</svg>
		);
	}

	// Facebook
	if (lowerName.includes("facebook")) {
		return (
			<svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
				<path
					fill="#1877F2"
					d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
				/>
			</svg>
		);
	}

	// Default link icon
	return <LinkIcon className="size-5 text-blue-600 shrink-0" />;
}

function App() {
	// auth steps: 'email' | 'reward' | 'password' | 'authenticated'
	const [authStep, setAuthStep] = useState<"email" | "reward" | "password" | "authenticated">("email");
	// Magic link state
	const [emailInput, setEmailInput] = useState("");
	const [magicLinkError, setMagicLinkError] = useState("");
	const [isSendingLink, setIsSendingLink] = useState(false);
	// Password step state
	const [passwordInput, setPasswordInput] = useState("");
	const [passwordError, setPasswordError] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [newLinkName, setNewLinkName] = useState("");
	const [newLinkUrl, setNewLinkUrl] = useState("");
	const [editingLink, setEditingLink] = useState<LinkModel | null>(null);
	const [editLinkName, setEditLinkName] = useState("");
	const [editLinkUrl, setEditLinkUrl] = useState("");
	const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);
	const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

	// GitHub integration state
	const [isGitHubDialogOpen, setIsGitHubDialogOpen] = useState(false);
	const [gitHubToken, setGitHubToken] = useState("");
	const [gitHubOwner, setGitHubOwner] = useState("");
	const [gitHubRepo, setGitHubRepo] = useState("");
	const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

	const queryClient = useQueryClient();

	// On mount: check URL for magic token and verify it
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token = params.get("magic_token");
		if (token) {
			// Clean the token from URL immediately
			const url = new URL(window.location.href);
			url.searchParams.delete("magic_token");
			window.history.replaceState({}, document.title, url.toString());

			if (verifyMagicToken(token)) {
				// Magic link valid — move to password step
				setAuthStep("password");
				const config = getGitHubConfig();
				if (config) {
					setGitHubConfig(config);
					setGitHubToken(config.token);
					setGitHubOwner(config.owner);
					setGitHubRepo(config.repo);
				}
			}
		}
	}, []);

	// Fetch all links from localStorage
	const { data: links = [], isLoading } = useQuery({
		queryKey: ["links"],
		queryFn: () => localLinkStore.getAll(),
		enabled: authStep === "authenticated",
	});

	// Add link mutation
	const addLinkMutation = useMutation({
		mutationFn: (data: { url: string; display_name: string }) =>
			Promise.resolve(localLinkStore.insert(data)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["links"] });
			setIsAddDialogOpen(false);
			setNewLinkName("");
			setNewLinkUrl("");
		},
	});

	// Update link mutation
	const updateLinkMutation = useMutation({
		mutationFn: (data: LinkModel) =>
			Promise.resolve(localLinkStore.update(data.id, { url: data.url, display_name: data.display_name })),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["links"] });
			setIsEditDialogOpen(false);
			setEditingLink(null);
			setEditLinkName("");
			setEditLinkUrl("");
		},
	});

	// Delete link mutation
	const deleteLinkMutation = useMutation({
		mutationFn: (id: string) => { localLinkStore.delete(id); return Promise.resolve(); },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["links"] });
		},
	});

	const handleAddLink = () => {
		if (newLinkName.trim() && newLinkUrl.trim()) {
			addLinkMutation.mutate({
				url: newLinkUrl.trim(),
				display_name: newLinkName.trim(),
			});
		}
	};

	const handleEditLink = (link: LinkModel) => {
		setEditingLink(link);
		setEditLinkName(link.display_name);
		setEditLinkUrl(link.url);
		setIsEditDialogOpen(true);
	};

	const handleUpdateLink = () => {
		if (editingLink && editLinkName.trim() && editLinkUrl.trim()) {
			updateLinkMutation.mutate({
				...editingLink,
				url: editLinkUrl.trim(),
				display_name: editLinkName.trim(),
			});
		}
	};

	const handleDeleteLink = (id: string) => {
		if (confirm("Are you sure you want to delete this link?")) {
			deleteLinkMutation.mutate(id);
		}
	};

	const handleCopyUrl = async (url: string, linkId: string) => {
		try {
			const textArea = document.createElement("textarea");
			textArea.value = url;
			textArea.style.position = "absolute";
			textArea.style.left = "-9999px";
			textArea.style.top = "0";
			textArea.setAttribute("readonly", "");
			document.body.appendChild(textArea);
			textArea.select();
			textArea.setSelectionRange(0, 99999);
			let success = false;
			try {
				success = document.execCommand("copy");
			} catch (err) {
				console.error("execCommand failed:", err);
			}
			document.body.removeChild(textArea);
			if (success) {
				setCopiedLinkId(linkId);
				setTimeout(() => setCopiedLinkId(null), 2000);
			} else if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(url);
				setCopiedLinkId(linkId);
				setTimeout(() => setCopiedLinkId(null), 2000);
			} else {
				alert("Copy failed. Please copy manually: " + url);
			}
		} catch (err) {
			console.error("Failed to copy URL:", err);
			alert("Copy failed. Your URL is: " + url);
		}
	};

	const toggleExpanded = (linkId: string) => {
		setExpandedLinkId(expandedLinkId === linkId ? null : linkId);
	};

	const handleRequestMagicLink = async (e: React.FormEvent) => {
		e.preventDefault();
		setMagicLinkError("");

		// Always record the email attempt for security auditing
		visitorLog.record(emailInput);

		if (!isAllowedEmail(emailInput)) {
			// Unknown email — show the gamified reward screen instead of an error
			setAuthStep("reward");
			return;
		}

		setIsSendingLink(true);
		try {
			const token = createMagicToken(emailInput);
			if (!token) {
				setMagicLinkError("Failed to generate magic link.");
				return;
			}
			await sendMagicLinkEmail(emailInput, token);
			// Authorized email — also show reward screen (magic link sent in background)
			setAuthStep("reward");
		} catch (err) {
			setMagicLinkError(err instanceof Error ? err.message : "Failed to send email.");
		} finally {
			setIsSendingLink(false);
		}
	};

	const handlePasswordSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const configuredPassword = import.meta.env.VITE_APP_PASSWORD;
		if (configuredPassword && passwordInput === configuredPassword) {
			setAuthStep("authenticated");
			setPasswordError(false);
		} else {
			setPasswordError(true);
			setPasswordInput("");
		}
	};

	// GitHub handlers
	const handleConnectGitHub = async () => {
		if (!gitHubToken.trim() || !gitHubOwner.trim() || !gitHubRepo.trim()) {
			setSyncStatus({ type: "error", message: "Please fill in all fields" });
			return;
		}

		setIsVerifying(true);
		setSyncStatus(null);

		const config: GitHubConfig = {
			token: gitHubToken.trim(),
			owner: gitHubOwner.trim(),
			repo: gitHubRepo.trim(),
		};

		try {
			const isValid = await verifyGitHubAccess(config);
			if (isValid) {
				saveGitHubConfig(config);
				setGitHubConfig(config);
				setSyncStatus({ type: "success", message: "Successfully connected to GitHub!" });
				setTimeout(() => {
					setIsGitHubDialogOpen(false);
					setSyncStatus(null);
				}, 1500);
			} else {
				setSyncStatus({ type: "error", message: "Invalid credentials or repository not found" });
			}
		} catch (error) {
			setSyncStatus({
				type: "error",
				message: error instanceof Error ? error.message : "Failed to connect",
			});
		} finally {
			setIsVerifying(false);
		}
	};

	const handleDisconnectGitHub = () => {
		clearGitHubConfig();
		setGitHubConfig(null);
		setGitHubToken("");
		setGitHubOwner("");
		setGitHubRepo("");
		setSyncStatus(null);
	};

	const handleSyncToGitHub = async () => {
		if (!gitHubConfig) {
			setSyncStatus({ type: "error", message: "Please connect to GitHub first" });
			return;
		}

		setIsSyncing(true);
		setSyncStatus(null);

		try {
			await syncToGitHub(links, gitHubConfig);
			setSyncStatus({ type: "success", message: `Synced ${links.length} links to GitHub!` });
			setTimeout(() => setSyncStatus(null), 3000);
		} catch (error) {
			setSyncStatus({
				type: "error",
				message: error instanceof Error ? error.message : "Failed to sync",
			});
		} finally {
			setIsSyncing(false);
		}
	};

	const handleRestoreFromGitHub = async () => {
		if (!gitHubConfig) {
			setSyncStatus({ type: "error", message: "Please connect to GitHub first" });
			return;
		}

		if (
			!confirm(
				"This will replace all your current links with the backup from GitHub. Are you sure?",
			)
		) {
			return;
		}

		setIsSyncing(true);
		setSyncStatus(null);

		try {
			const restoredLinks = await restoreFromGitHub(gitHubConfig);
			localStorage.setItem("akash_links_v1", JSON.stringify(restoredLinks));
			queryClient.invalidateQueries({ queryKey: ["links"] });
			setSyncStatus({ type: "success", message: `Restored ${restoredLinks.length} links from GitHub!` });
			setTimeout(() => setSyncStatus(null), 3000);
		} catch (error) {
			setSyncStatus({
				type: "error",
				message: error instanceof Error ? error.message : "Failed to restore",
			});
		} finally {
			setIsSyncing(false);
		}
	};

	// Reward screen — shown after any email submission
	if (authStep === "reward") {
		return (
			<RewardScreen
				email={emailInput}
				onRetry={() => {
					setAuthStep("email");
					setEmailInput("");
					setMagicLinkError("");
				}}
			/>
		);
	}

	// Password screen
	if (authStep === "email") {
		return (
			<div className="min-h-screen w-full bg-gradient-to-br from-black via-green-950 to-black flex flex-col items-center justify-center px-4">
				<div className="w-full max-w-2xl text-center mb-12">
					<div className="flex justify-center mb-6">
						<div className="bg-green-950 p-8 rounded-full">
							<MailIcon className="size-16 text-green-400" />
						</div>
					</div>
					<h1 className="text-5xl font-bold bg-gradient-to-r from-black to-green-400 bg-clip-text text-transparent">Secure Access</h1>
					<p className="mt-4">
						<span className="text-lg font-black font-mono tracking-widest uppercase text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.9)] italic" style={{textShadow: '0 0 8px #4ade80, 0 0 20px #16a34a'}}>⬡ NOTE: Invalid email broke the application. ⬡</span>
					</p>
				</div>
				<form onSubmit={handleRequestMagicLink} className="w-full max-w-2xl space-y-6">
					<div className="space-y-3">
						<Label htmlFor="email" className="text-lg bg-gradient-to-r from-black to-green-400 bg-clip-text text-transparent font-bold">
							IP Address
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="wait a minute! whoo are youuu?"
							value={emailInput}
							onChange={(e) => {
								setEmailInput(e.target.value);
								setMagicLinkError("");
							}}
							className={`h-14 text-lg bg-black text-green-400 border-green-700 placeholder:text-green-800 focus:border-green-400 focus:ring-green-400 ${magicLinkError ? "border-red-500 focus:border-red-500" : ""}`}
							autoFocus
							autoComplete="email"
						/>
						{magicLinkError && (
							<p className="text-sm text-red-500">{magicLinkError}</p>
						)}
					</div>
					<Button
						type="submit"
						className="w-full h-14 text-lg bg-gradient-to-r from-black to-green-700 hover:from-green-900 hover:to-black text-green-300 border border-green-600 font-bold"
						disabled={isSendingLink || !emailInput.trim()}
					>
						<SendIcon className="size-5 mr-2" />
						{isSendingLink ? "Sending..." : "Enter valid mail"}
					</Button>
					<div className="w-full rounded-lg bg-black px-6 py-4">
						<p className="w-full text-center text-base font-black tracking-widest leading-snug text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)] font-mono uppercase">
							⚠️ 🔓 Providing your email allows attackers to steal your data. 💀📡🕵️
						</p>
					</div>
				</form>
			</div>
		);
	}

	if (authStep === "password") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
				<Card className="w-full max-w-md bg-white border-0 shadow-xl">
					<CardHeader className="text-center pb-3">
						<div className="flex justify-center mb-4">
							<div className="bg-green-100 p-4 rounded-full">
								<CheckCircle2Icon className="size-8 text-green-600" />
							</div>
						</div>
						<CardTitle className="text-2xl font-bold text-slate-900">One More Step</CardTitle>
						<CardDescription className="text-slate-600 mt-2">
							Magic link verified. Enter your password to continue.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handlePasswordSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="password" className="text-slate-700">
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={passwordInput}
									onChange={(e) => {
										setPasswordInput(e.target.value);
										setPasswordError(false);
									}}
									className={`border-0 shadow-sm ${passwordError ? "ring-2 ring-red-500" : ""}`}
									autoFocus
								/>
								{passwordError && (
									<p className="text-sm text-red-600">Incorrect password. Please try again.</p>
								)}
							</div>
							<Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
								Unlock Vault
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
			<div className="container mx-auto px-4 py-6 sm:py-12 max-w-6xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 px-2">
						{APP_CONFIG.welcomeMessage}, {APP_CONFIG.userName}
					</h1>
					<p className="text-slate-600 text-sm sm:text-base">{APP_CONFIG.tagline}</p>

					{/* GitHub Status Badge */}
					{gitHubConfig && (
						<div className="mt-3 flex justify-center">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleDisconnectGitHub}
								className="text-slate-600 hover:text-slate-900 text-xs"
								title="Disconnect GitHub"
							>
								<GithubIcon className="size-4 text-slate-700" />
								<span className="max-w-[140px] truncate">
									{gitHubConfig.owner}/{gitHubConfig.repo}
								</span>
								<XCircleIcon className="size-3" />
							</Button>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				<div className="mb-6 flex justify-center gap-2 sm:gap-3 flex-wrap">
					<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<DialogTrigger asChild>
							<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
								<PlusIcon className="size-4" />
								<span className="hidden sm:inline">Add New Link</span>
								<span className="sm:hidden">Add</span>
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-white">
							<DialogHeader>
								<DialogTitle className="text-slate-900">Add New Link</DialogTitle>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="link-name" className="text-slate-700">
										Link Name
									</Label>
									<Input
										id="link-name"
										placeholder="Enter a custom name for this link"
										value={newLinkName}
										onChange={(e) => setNewLinkName(e.target.value)}
										className="border-slate-300 focus:border-blue-500"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="link-url" className="text-slate-700">
										URL
									</Label>
									<Input
										id="link-url"
										type="url"
										placeholder="https://example.com"
										value={newLinkUrl}
										onChange={(e) => setNewLinkUrl(e.target.value)}
										className="border-slate-300 focus:border-blue-500"
									/>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setIsAddDialogOpen(false)}
									className="border-slate-300 text-slate-700"
								>
									Cancel
								</Button>
								<Button
									onClick={handleAddLink}
									disabled={!newLinkName.trim() || !newLinkUrl.trim() || addLinkMutation.isPending}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									{addLinkMutation.isPending ? "Adding..." : "Add Link"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* GitHub Sync Button */}
					{gitHubConfig ? (
						<>
							<Button
								onClick={handleSyncToGitHub}
								disabled={isSyncing}
								className="bg-slate-800 hover:bg-slate-900 text-white shadow-md"
							>
								<UploadIcon className="size-4" />
								<span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync to GitHub"}</span>
								<span className="sm:hidden">{isSyncing ? "..." : "Sync"}</span>
							</Button>
							<Button
								onClick={handleRestoreFromGitHub}
								disabled={isSyncing}
								variant="outline"
								className="border-slate-300 text-slate-700 shadow-md"
							>
								<DownloadIcon className="size-4" />
								<span className="hidden sm:inline">Restore from GitHub</span>
								<span className="sm:hidden">Restore</span>
							</Button>
						</>
					) : (
						<Dialog open={isGitHubDialogOpen} onOpenChange={setIsGitHubDialogOpen}>
							<DialogTrigger asChild>
								<Button variant="outline" className="border-slate-300 text-slate-700 shadow-md">
									<GithubIcon className="size-4" />
									<span className="hidden sm:inline">Connect GitHub</span>
									<span className="sm:hidden">GitHub</span>
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-white max-w-md">
								<DialogHeader>
									<DialogTitle className="text-slate-900 flex items-center gap-2">
										<GithubIcon className="size-5" />
										Connect to GitHub
									</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="github-token" className="text-slate-700">
											Personal Access Token
										</Label>
										<Input
											id="github-token"
											type="password"
											placeholder="ghp_xxxxxxxxxxxx"
											value={gitHubToken}
											onChange={(e) => setGitHubToken(e.target.value)}
											className="border-slate-300 focus:border-blue-500"
										/>
										<p className="text-xs text-slate-500">
											Create a token at{" "}
											<a
												href="https://github.com/settings/tokens/new?scopes=repo&description=Link%20Manager"
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline"
											>
												github.com/settings/tokens
											</a>{" "}
											with <code className="bg-slate-100 px-1 rounded">repo</code> scope
										</p>
									</div>
									<div className="space-y-2">
										<Label htmlFor="github-owner" className="text-slate-700">
											GitHub Username/Organization
										</Label>
										<Input
											id="github-owner"
											placeholder="your-username"
											value={gitHubOwner}
											onChange={(e) => setGitHubOwner(e.target.value)}
											className="border-slate-300 focus:border-blue-500"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="github-repo" className="text-slate-700">
											Repository Name
										</Label>
										<Input
											id="github-repo"
											placeholder="link-manager-backup"
											value={gitHubRepo}
											onChange={(e) => setGitHubRepo(e.target.value)}
											className="border-slate-300 focus:border-blue-500"
										/>
										<p className="text-xs text-slate-500">
											Your links will be saved to{" "}
											<code className="bg-slate-100 px-1 rounded">links-backup.json</code> in this repository
										</p>
									</div>

									{syncStatus && (
										<div
											className={`flex items-center gap-2 p-3 rounded-lg ${
												syncStatus.type === "success"
													? "bg-green-50 text-green-700"
													: "bg-red-50 text-red-700"
											}`}
										>
											{syncStatus.type === "success" ? (
												<CheckCircle2Icon className="size-5" />
											) : (
												<XCircleIcon className="size-5" />
											)}
											<span className="text-sm">{syncStatus.message}</span>
										</div>
									)}
								</div>
								<DialogFooter>
									<Button
										variant="outline"
										onClick={() => setIsGitHubDialogOpen(false)}
										className="border-slate-300 text-slate-700"
									>
										Cancel
									</Button>
									<Button
										onClick={handleConnectGitHub}
										disabled={isVerifying}
										className="bg-slate-800 hover:bg-slate-900 text-white"
									>
										<GithubIcon className="size-4" />
										{isVerifying ? "Connecting..." : "Connect"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					)}
				</div>

				{/* Sync Status Banner */}
				{syncStatus && !isGitHubDialogOpen && (
					<div className="mb-6 flex justify-center">
						<div
							className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md ${
								syncStatus.type === "success"
									? "bg-green-50 text-green-700 border border-green-200"
									: "bg-red-50 text-red-700 border border-red-200"
							}`}
						>
							{syncStatus.type === "success" ? (
								<CheckCircle2Icon className="size-5" />
							) : (
								<XCircleIcon className="size-5" />
							)}
							<span className="text-sm font-medium">{syncStatus.message}</span>
						</div>
					</div>
				)}

				{/* Links Grid */}
				{isLoading ? (
					<div className="text-center py-12 text-slate-600">Loading links...</div>
				) : links.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-slate-600 mb-4">No links yet. Add your first link to get started!</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{links.map((link: LinkModel) => {
							const linkIcon = getIconForLink(link.display_name);
							const isExpanded = expandedLinkId === link.id;
							const isCopied = copiedLinkId === link.id;

							return (
								<Card key={link.id} className="bg-white border-0 hover:shadow-lg transition-all">
									<CardHeader className="pb-3">
										<div
											className="flex items-center gap-3 cursor-pointer"
											onClick={() => toggleExpanded(link.id)}
										>
											{linkIcon}
											<CardTitle className="text-lg text-slate-900 truncate">{link.display_name}</CardTitle>
										</div>

										{isExpanded && (
											<div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
												<CardDescription className="text-sm text-blue-600 hover:text-blue-700 break-all">
													<div className="flex items-center gap-2">
														<a
															href={link.url}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 hover:underline flex-1"
															onClick={(e) => e.stopPropagation()}
														>
															{link.url}
															<ExternalLinkIcon className="size-3 shrink-0" />
														</a>
														<div className="flex items-center gap-1">
															<Button
																variant="ghost"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	handleCopyUrl(link.url, link.id);
																}}
																className="h-6 w-6 p-0 hover:bg-blue-50"
																title="Copy URL"
															>
																<CopyIcon
																	className={`size-3 ${isCopied ? "text-green-600" : "text-slate-600"}`}
																/>
															</Button>
															{isCopied && (
																<span className="text-xs text-green-600 font-medium animate-in fade-in duration-200">
																	Copied!
																</span>
															)}
														</div>
													</div>
												</CardDescription>

												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleEditLink(link);
														}}
														className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
													>
														<Edit2Icon className="size-3" />
														Edit
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteLink(link.id);
														}}
														disabled={deleteLinkMutation.isPending}
														className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
													>
														<Trash2Icon className="size-3" />
														Delete
													</Button>
												</div>
											</div>
										)}
									</CardHeader>
									<CardContent />
								</Card>
							);
						})}
					</div>
				)}

				{/* Edit Link Dialog */}
				<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
					<DialogContent className="bg-white">
						<DialogHeader>
							<DialogTitle className="text-slate-900">Edit Link</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="edit-link-name" className="text-slate-700">
									Link Name
								</Label>
								<Input
									id="edit-link-name"
									placeholder="Enter a custom name for this link"
									value={editLinkName}
									onChange={(e) => setEditLinkName(e.target.value)}
									className="border-slate-300 focus:border-blue-500"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-link-url" className="text-slate-700">
									URL
								</Label>
								<Input
									id="edit-link-url"
									type="url"
									placeholder="https://example.com"
									value={editLinkUrl}
									onChange={(e) => setEditLinkUrl(e.target.value)}
									className="border-slate-300 focus:border-blue-500"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsEditDialogOpen(false)}
								className="border-slate-300 text-slate-700"
							>
								Cancel
							</Button>
							<Button
								onClick={handleUpdateLink}
								disabled={!editLinkName.trim() || !editLinkUrl.trim() || updateLinkMutation.isPending}
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								{updateLinkMutation.isPending ? "Saving..." : "Update Link"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
