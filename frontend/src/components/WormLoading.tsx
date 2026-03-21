export const WormLoading = () => {
	return (
		<>
			<style>{`
				@keyframes bigBounce {
					0%, 100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-8px);
					}
				}
				.big-bounce {
					animation: bigBounce 1.4s ease-in-out infinite;
				}
			`}</style>
			<div className="flex items-center justify-center space-x-1">
				<div className="w-2 h-2 bg-[#c6c6c6] rounded-full big-bounce" style={{ animationDelay: '0ms' }}></div>
				<div className="w-2 h-2 bg-[#c6c6c6] rounded-full big-bounce" style={{ animationDelay: '160ms' }}></div>
				<div className="w-2 h-2 bg-[#c6c6c6] rounded-full big-bounce" style={{ animationDelay: '320ms' }}></div>
			</div>
		</>
	)
}
