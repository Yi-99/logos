import React from 'react'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MicNoneIcon from '@mui/icons-material/MicNone';

interface InputSettingsBarProps {
	isSpeechToSpeech: boolean;
	isTextToText: boolean; 
	isSpeechToText: boolean;
	isTextToSpeech: boolean;
	onModeChange?: (mode: 'speechToSpeech' | 'textToText' | 'speechToText' | 'textToSpeech') => void;
}

const InputSettingsBar: React.FC<InputSettingsBarProps> = ({
	isSpeechToSpeech,
	isTextToText, 
	isSpeechToText,
	isTextToSpeech,
	onModeChange
}) => {
	const handleModeChange = (mode: 'speechToSpeech' | 'textToText' | 'speechToText' | 'textToSpeech') => {
		onModeChange?.(mode);
	};

	return (
		<div className="flex flex-row justify-between items-center rounded-[3rem] px-3 py-3 border border-gray-200 w-fit gap-2 shadow-md">
			<button
				onClick={() => handleModeChange('textToText')}
				className={`p-2 hover:cursor-pointer rounded-full transition-colors ${
					isTextToText ? 'bg-black text-white' : 'hover:bg-gray-200'
				}`}
				title="Text to Text"
			>
				<ChatBubbleOutlineIcon />
			</button>
			<button
				onClick={() => handleModeChange('speechToSpeech')}
				className={`p-2 hover:cursor-pointer rounded-full transition-colors ${
					isSpeechToSpeech ? 'bg-black text-white' : 'hover:bg-gray-200'
				}`}
				title="Speech to Speech"
			>
				<MicNoneIcon />
			</button>
		</div>
	)
}

export default InputSettingsBar
