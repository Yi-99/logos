import axios from "axios";
import GetAllPhilosophersResponse from "@/constants/responses/GetAllPhilosophers";
import { toast } from "react-toastify";
import { Philosopher } from "@/constants/types/Philosopher";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

// Cache storage
let allPhilosophersCache: CacheEntry<GetAllPhilosophersResponse> | null = null;
const philosopherByIdCache = new Map<string, CacheEntry<Philosopher>>();
let imageUrlsCache: CacheEntry<Record<string, string>> | null = null;

const isCacheValid = <T>(cache: CacheEntry<T> | null | undefined): cache is CacheEntry<T> => {
	if (!cache) return false;
	return Date.now() - cache.timestamp < CACHE_TTL_MS;
};

const mapPhilosopherResponse = (data: any): Philosopher => ({
	id: data.id,
	name: data.name,
	subtitle: data.subtitle,
	description: data.description,
	quote: data.quote,
	dates: data.dates,
	location: data.location,
	image: data.image,
	imageClassic: data.image_classic,
	metaphysicsCategory: data.metaphysics_category,
	sortOrder: data.sort_order,
});

const getAllPhilosophers = async (): Promise<GetAllPhilosophersResponse> => {
	// Return cached data if valid
	if (isCacheValid(allPhilosophersCache)) {
		return allPhilosophersCache.data;
	}

	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/`);
		const getAllPhilosophersResponse: GetAllPhilosophersResponse = {
			philosophers: response.data.map(mapPhilosopherResponse)
		};

		// Update cache
		allPhilosophersCache = {
			data: getAllPhilosophersResponse,
			timestamp: Date.now(),
		};

		// Also populate individual philosopher cache
		getAllPhilosophersResponse.philosophers.forEach((philosopher) => {
			philosopherByIdCache.set(philosopher.id, {
				data: philosopher,
				timestamp: Date.now(),
			});
		});

		return getAllPhilosophersResponse;
	} catch (error: any) {
		toast.error('Error: ' + error.response?.data?.message || error.message, {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: false,
			progress: undefined,
			theme: 'light',
		});
		throw error;
	}
};

const getPhilosopherById = async (id: string): Promise<Philosopher> => {
	// Return cached data if valid
	const cached = philosopherByIdCache.get(id);
	if (isCacheValid(cached)) {
		return cached.data;
	}

	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/${id}`);
		const philosopher = mapPhilosopherResponse(response.data);

		// Update cache
		philosopherByIdCache.set(id, {
			data: philosopher,
			timestamp: Date.now(),
		});

		return philosopher;
	} catch (error: any) {
		toast.error('Error: ' + error.response?.data?.message || error.message, {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
		});
		throw error;
	}
};

const getPhilosopherImageUrl = async (imageKey: string): Promise<string> => {
	// Check if this key is already in the batch cache
	if (isCacheValid(imageUrlsCache)) {
		const filename = imageKey.split('/').pop() || imageKey;
		const cached = imageUrlsCache.data[filename];
		if (cached) return cached;
	}

	const filename = imageKey.split('/').pop() || imageKey;
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/image`, {
		params: { key: filename },
	});
	return response.data.url;
};

const getPhilosopherImageUrls = async (imageKeys: string[]): Promise<Record<string, string>> => {
	const filenames = imageKeys.map(k => k.split('/').pop() || k);

	// If cache is valid, find which keys we already have
	if (isCacheValid(imageUrlsCache)) {
		const missing = filenames.filter(f => !imageUrlsCache!.data[f]);
		if (missing.length === 0) return imageUrlsCache.data;
		// Only fetch missing keys
		if (missing.length < filenames.length) {
			const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/images`, {
				keys: missing,
			});
			const newUrls = response.data.urls as Record<string, string>;
			imageUrlsCache.data = { ...imageUrlsCache.data, ...newUrls };
			return imageUrlsCache.data;
		}
	}

	const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/images`, {
		keys: filenames,
	});
	const urls = response.data.urls as Record<string, string>;
	imageUrlsCache = { data: urls, timestamp: Date.now() };
	return urls;
};

const clearCache = () => {
	allPhilosophersCache = null;
	philosopherByIdCache.clear();
	imageUrlsCache = null;
};

const philosopherService = {
	getAllPhilosophers,
	getPhilosopherById,
	getPhilosopherImageUrl,
	getPhilosopherImageUrls,
	clearCache,
};

export default philosopherService;