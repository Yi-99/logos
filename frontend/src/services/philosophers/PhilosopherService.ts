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
	sortOrder: data.sort_order,
});

const getAllPhilosophers = async (): Promise<GetAllPhilosophersResponse> => {
	// Return cached data if valid
	if (isCacheValid(allPhilosophersCache)) {
		return allPhilosophersCache.data;
	}

	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers`);
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
	const filename = imageKey.split('/').pop() || imageKey;
	const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/image`, {
		params: { key: filename },
	});
	return response.data.url;
};

const clearCache = () => {
	allPhilosophersCache = null;
	philosopherByIdCache.clear();
};

const philosopherService = {
	getAllPhilosophers,
	getPhilosopherById,
	getPhilosopherImageUrl,
	clearCache,
};

export default philosopherService;