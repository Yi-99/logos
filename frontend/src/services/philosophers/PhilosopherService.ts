import axios from "axios";
import GetAllPhilosophersResponse from "@/constants/responses/GetAllPhilosophers";
import { toast } from "react-toastify";
import { Philosopher } from "@/constants/types/Philosopher";

const getAllPhilosophers = async () => {
	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers`);
		const getAllPhilosophersResponse: GetAllPhilosophersResponse = {
			philosophers: response.data.data.map((philosopher: any) => ({
				id: philosopher.id,
				name: philosopher.name,
				subtitle: philosopher.subtitle,
				description: philosopher.description,
				quote: philosopher.quote,
				dates: philosopher.dates,
				location: philosopher.location,
				image: philosopher.image,
				imageClassic: philosopher.image_classic,
				sortOrder: philosopher.sort_order,
			}))
		};

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

const getPhilosopherById = async (id: string) => {
	try {
		const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/philosophers/${id}`);
		const getPhilosopherByIdResponse: Philosopher = {
			id: response.data.id,
			name: response.data.name,
			subtitle: response.data.subtitle,
			description: response.data.description,
			quote: response.data.quote,
			dates: response.data.dates,
			location: response.data.location,
			image: response.data.image,
			imageClassic: response.data.image_classic,
			sortOrder: response.data.sort_order,
		};
		return getPhilosopherByIdResponse;
	} catch (error: any) {
		toast.error('Error: ' + error.response?.data?.message || error.message, {
			position: 'bottom-right',
			autoClose: 5000,
			hideProgressBar: false,
		});
		throw error;
	}
}

const philosopherService = {
	getAllPhilosophers,
	getPhilosopherById,
}

export default philosopherService;