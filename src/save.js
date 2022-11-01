/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/packages/packages-block-editor/#useBlockProps
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#save
 *
 * @return {WPElement} Element to render.
 */
export default function Save({ attributes }) {
	const {
	  founder = -1,
	  founderFAB = false,
	  backgroundColor = '#000000',
	  foregroundColor = '#CCCCCC',
	  textColor = '#333333',
		highlightColor = '#770000',
	} = attributes;
	return (
		<p { ...useBlockProps.save() }>
		  <div style="position:relative; min-height: 640px;">
			  <div
			    id="testtest"
				data-founder={ founder }
				data-founder-fab={ founderFAB }
				data-background-color={ backgroundColor }
				data-foreground-color={ foregroundColor }
				data-text-color={ textColor }
				data-highlight-color={ highlightColor }
			  />
		  </div>
		</p>
	);
}
