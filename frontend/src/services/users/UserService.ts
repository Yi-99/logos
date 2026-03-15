import axios from 'axios';

export interface SyncUserRequest {
	user_id: string;
	email: string;
	display_name?: string;
}

export interface SyncUserResponse {
	id: string;
	email: string;
}

const syncUser = async (request: SyncUserRequest): Promise<SyncUserResponse> => {
	const response = await axios.post(
		`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/sync`,
		request
	);
	return response.data;
};

const userService = {
	syncUser,
};

export default userService;
