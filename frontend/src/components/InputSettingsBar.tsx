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
		<div className="flex flex-row justify-between items-center rounded-[3rem] px-3 py-3 border border-ink-outline-variant/20 w-fit gap-2 bg-ink-surface">
			<button
				onClick={() => handleModeChange('textToText')}
				className={`p-2 hover:cursor-pointer rounded-full transition-colors duration-300 ${
					isTextToText ? 'bg-ink-primary text-ink-on-primary' : 'text-ink-on-surface-variant hover:bg-ink-surface-highest hover:text-ink-on-surface'
				}`}
				title="Text to Text"
			>
				<ChatBubbleOutlineIcon />
			</button>
			<button
				onClick={() => handleModeChange('speechToSpeech')}
				className={`p-2 hover:cursor-pointer rounded-full transition-colors duration-300 ${
					isSpeechToSpeech ? 'bg-ink-primary text-ink-on-primary' : 'text-ink-on-surface-variant hover:bg-ink-surface-highest hover:text-ink-on-surface'
				}`}
				title="Speech to Speech"
			>
				<MicNoneIcon />
			</button>
		</div>
	)
}

export default InputSettingsBar
