import React from 'react'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MicNoneIcon from '@mui/icons-material/MicNone';

interface InputSettingsBarProps {
	isSpeechToSpeech: boolean;
	isTextToText: boolean;
	isSpeechToText: boolean;
	isTextToSpeech: boolean;
	onModeChange?: (mode: 'speechToSpeech' | 'textToText') => void;
}

const InputSettingsBar: React.FC<InputSettingsBarProps> = ({
	isSpeechToSpeech,
	isTextToText,
	onModeChange
}) => {
	const handleModeChange = (mode: 'speechToSpeech' | 'textToText') => {
		onModeChange?.(mode);
	};

	return (
		<div className="flex flex-row justify-between items-center rounded-[3rem] px-3 py-3 border border-[#484848]/20 w-fit gap-2 bg-[#191a1a]">
			<button
				onClick={() => handleModeChange('textToText')}
				className={`p-2 hover:cursor-pointer rounded-full transition-colors duration-300 ${
					isTextToText ? 'bg-[#c6c6c6] text-[#0e0e0e]' : 'text-[#acabaa] hover:bg-[#252626] hover:text-[#e7e5e5]'
				}`}
				title="Text to Text"
			>
				<ChatBubbleOutlineIcon />
			</button>
			<button
				onClick={() => handleModeChange('speechToSpeech')}
				className={`p-2 hover:cursor-pointer rounded-full transition-colors duration-300 ${
					isSpeechToSpeech ? 'bg-[#c6c6c6] text-[#0e0e0e]' : 'text-[#acabaa] hover:bg-[#252626] hover:text-[#e7e5e5]'
				}`}
				title="Speech to Speech"
			>
				<MicNoneIcon />
			</button>
		</div>
	)
}

export default InputSettingsBar
