import { addIcon } from 'obsidian';

/**
 * Custom icons for the color toggle commands.
 *
 * Lucide icons inherit `currentColor`, so every color command would look
 * identical in the mobile toolbar. These hardcode the same hex values as
 * `styles.css` so each button shows the color it applies.
 *
 * `addIcon` content is placed inside an SVG with a `0 0 100 100` viewBox.
 */
const ICON_PREFIX = 'toggle-color-tag';

export function iconIdFor(className: string): string {
	return `${ICON_PREFIX}-${className}`;
}

export function registerColorIcons(colors: { class: string; color: string }[]): void {
	colors.forEach(({ class: className, color }) => {
		addIcon(
			iconIdFor(className),
			`<circle cx="50" cy="50" r="34" fill="${color}" stroke="${color}" stroke-width="8" />`,
		);
	});
}
