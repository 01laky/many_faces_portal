# Radix UI Components

This project uses Radix UI for accessible, unstyled UI components.

## Installed Components

All Radix UI components are installed and ready to use:

- **@radix-ui/react-accordion** - Collapsible content sections
- **@radix-ui/react-alert-dialog** - Modal dialogs for alerts
- **@radix-ui/react-aspect-ratio** - Maintain aspect ratios
- **@radix-ui/react-avatar** - User avatars
- **@radix-ui/react-checkbox** - Checkbox input
- **@radix-ui/react-collapsible** - Collapsible content
- **@radix-ui/react-context-menu** - Right-click context menus
- **@radix-ui/react-dialog** - Modal dialogs
- **@radix-ui/react-dropdown-menu** - Dropdown menus
- **@radix-ui/react-hover-card** - Hover cards
- **@radix-ui/react-label** - Form labels
- **@radix-ui/react-menubar** - Menu bars
- **@radix-ui/react-navigation-menu** - Navigation menus
- **@radix-ui/react-popover** - Popover content
- **@radix-ui/react-progress** - Progress indicators
- **@radix-ui/react-radio-group** - Radio button groups
- **@radix-ui/react-scroll-area** - Custom scrollbars
- **@radix-ui/react-select** - Select dropdowns
- **@radix-ui/react-separator** - Dividers/separators
- **@radix-ui/react-slider** - Range sliders
- **@radix-ui/react-slot** - Composition utility
- **@radix-ui/react-switch** - Toggle switches
- **@radix-ui/react-tabs** - Tab interfaces
- **@radix-ui/react-toast** - Toast notifications
- **@radix-ui/react-toggle** - Toggle buttons
- **@radix-ui/react-toggle-group** - Toggle button groups
- **@radix-ui/react-tooltip** - Tooltips

## Usage

Radix UI components are headless (unstyled), so you need to add your own styles. They work great with CSS, Tailwind, or styled-components.

### Example: Dialog

```tsx
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
	return (
		<Dialog.Root>
			<Dialog.Trigger>Open</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content>
					<Dialog.Title>Title</Dialog.Title>
					<Dialog.Description>Description</Dialog.Description>
					<Dialog.Close>Close</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
```

### Example: Select

```tsx
import * as Select from '@radix-ui/react-select';

function MySelect() {
	return (
		<Select.Root>
			<Select.Trigger>
				<Select.Value placeholder="Select..." />
			</Select.Trigger>
			<Select.Portal>
				<Select.Content>
					<Select.Viewport>
						<Select.Item value="1">Option 1</Select.Item>
						<Select.Item value="2">Option 2</Select.Item>
					</Select.Viewport>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
}
```

## Styling

Since Radix UI components are unstyled, you can style them however you want:

1. **CSS Classes** - Add classes and style with CSS/SCSS
2. **Tailwind CSS** - Use Tailwind utility classes
3. **Styled Components** - Use CSS-in-JS
4. **Bootstrap** - Combine with Bootstrap classes

## Documentation

Full documentation: https://www.radix-ui.com/primitives/docs/overview/introduction
