export const WormLoading = () => {
	return (
		<div className="flex items-center justify-center space-x-1">
			<div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
			<div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '160ms', animationDuration: '1.4s' }}></div>
			<div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '320ms', animationDuration: '1.4s' }}></div>
		</div>
	)
}