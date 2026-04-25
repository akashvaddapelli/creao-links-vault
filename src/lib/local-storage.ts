/**
 * Local storage-based link management.
 * Stores all links directly in the browser's localStorage.
 * No external API or authentication required.
 */

export interface LinkModel {
	id: string;
	url: string;
	display_name: string;
	create_time: string;
	update_time: string;
}

const STORAGE_KEY = "akash_links_v1";

function generateId(): string {
	return `link_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
	return Math.floor(Date.now() / 1000).toString();
}

function loadLinks(): LinkModel[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw) as LinkModel[];
	} catch {
		return [];
	}
}

function saveLinks(links: LinkModel[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export const localLinkStore = {
	getAll(): LinkModel[] {
		return loadLinks();
	},

	insert(data: { url: string; display_name: string }): LinkModel {
		const links = loadLinks();
		const newLink: LinkModel = {
			id: generateId(),
			url: data.url,
			display_name: data.display_name,
			create_time: now(),
			update_time: now(),
		};
		links.push(newLink);
		saveLinks(links);
		return newLink;
	},

	update(id: string, data: { url: string; display_name: string }): LinkModel | null {
		const links = loadLinks();
		const idx = links.findIndex((l) => l.id === id);
		if (idx === -1) return null;
		links[idx] = {
			...links[idx],
			url: data.url,
			display_name: data.display_name,
			update_time: now(),
		};
		saveLinks(links);
		return links[idx];
	},

	delete(id: string): void {
		const links = loadLinks().filter((l) => l.id !== id);
		saveLinks(links);
	},
};
