import { useEffect } from 'react';

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
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

import { PanelBody, SelectControl } from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import App from './App';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes  }) {
	const { align, family } = attributes;

	useEffect(() => {
    window.dispatchEvent(new Event('resize'));
	}, [align]);

	return (
		<div { ...useBlockProps() }>
			<InspectorControls key="setting">
				  <PanelBody title="Attribute Settings" initialOpen={ true }>
				    <SelectControl
  					  label={ __( 'Current family', 'pedigree' ) }
	  					labelPosition= 'side'
              value={ family }
              onChange={ ( v ) => setAttributes( { family: v } ) }
				  		options={ [
					  		{ label: 'Default', value: 'default' },
						  	{ label: 'Test', value: 'test' },
							  { label: 'Meyer', value: 'meyer' },
					    ] }
						/>
				  </PanelBody>
			</InspectorControls>
			<div style={
			  { position: 'relative',
			    minHeight: '640px',
			  }}
			>
			  <App />
		  </div>
		</div>
	);
}
