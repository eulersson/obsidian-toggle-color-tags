import { Editor, Plugin } from 'obsidian';
import { iconIdFor, registerColorIcons } from './icons';

export default class ToggleColorTagsPlugin extends Plugin {
	async onload() {
		// Colors must stay in sync with the `i.<class>` rules in `styles.css`.
		const colors = [
			{ name: 'Green', class: 'g', color: '#6aa84f' },
			{ name: 'Blue', class: 'b', color: '#3c78d8' },
			{ name: 'Red', class: 'r', color: '#cc0000' },
			{ name: 'Pink', class: 'p', color: '#d679d6' },
			{ name: 'Yellow', class: 'y', color: '#f1c231' },
		];

		registerColorIcons(colors);

		colors.forEach(({ name, class: className }) => {
			this.addCommand({
				id: `toggle-${className}-tag`,
				name: `${name} (${className})`,
				icon: iconIdFor(className),
				editorCallback: (editor: Editor) => {
					const selectedText = editor.getSelection();
					const doc = editor.getValue();

					const openingTag = `<i class="${className}">`;
					const closingTag = `</i>`;

					const startOffset = editor.posToOffset(editor.getCursor('from'));
					const endOffset = editor.posToOffset(editor.getCursor('to'));

					const openingTagRegex = new RegExp(`<i\\s+class="${className}">`, 'g');
					const closingTagRegex = new RegExp(`</i>`, 'g');

					let openingMatch: RegExpExecArray | null;
					let tagStart = -1;
					let tagEnd = -1;

					while ((openingMatch = openingTagRegex.exec(doc)) !== null) {
						const oStart = openingMatch.index;

						const closingMatch = closingTagRegex.exec(doc);
						if (!closingMatch) break;

						const cStart = closingMatch.index;
						const cEnd = cStart + closingMatch[0].length;

						if (startOffset >= oStart && endOffset <= cEnd) {
							tagStart = oStart;
							tagEnd = cEnd;
							break;
						}
					}

					if (tagStart !== -1 && tagEnd !== -1) {
						const innerText = doc.slice(
							tagStart + openingTag.length,
							tagEnd - closingTag.length,
						);
						editor.replaceRange(
							innerText,
							editor.offsetToPos(tagStart),
							editor.offsetToPos(tagEnd),
						);
						return;
					}

					if (selectedText) {
						if (
							selectedText.startsWith(openingTag) &&
							selectedText.endsWith(closingTag)
						) {
							const inner = selectedText.slice(
								openingTag.length,
								selectedText.length - closingTag.length,
							);
							editor.replaceSelection(inner);
						} else {
							editor.replaceSelection(`${openingTag}${selectedText}${closingTag}`);
						}
					} else {
						editor.replaceSelection(`${openingTag}${closingTag}`);
						const newCursor = editor.offsetToPos(startOffset + openingTag.length);
						editor.setCursor(newCursor);
					}
				},
			});
		});

		// Clear ALL color tags
		this.addCommand({
			id: 'clear-color-tags',
			name: 'Clear all color tags',
			icon: 'eraser',
			editorCallback: (editor: Editor) => {
				const doc = editor.getValue();
				const startOffset = editor.posToOffset(editor.getCursor('from'));
				const endOffset = editor.posToOffset(editor.getCursor('to'));

				const tagRegex = /<i class="(g|b|r|p)">([\s\S]*?)<\/i>/g;

				let regionStart = startOffset;
				let regionEnd = endOffset;

				if (startOffset === endOffset) {
					let match: RegExpExecArray | null;
					while ((match = tagRegex.exec(doc)) !== null) {
						const matchStart = match.index;
						const matchEnd = match.index + match[0].length;
						if (startOffset >= matchStart && startOffset <= matchEnd) {
							regionStart = matchStart;
							regionEnd = matchEnd;
							break;
						}
					}
				}

				const regionText = doc.slice(regionStart, regionEnd);
				const cleaned = regionText.replace(tagRegex, '$2');

				if (regionText !== cleaned) {
					editor.replaceRange(
						cleaned,
						editor.offsetToPos(regionStart),
						editor.offsetToPos(regionEnd),
					);
				}
			},
		});
	}
}
