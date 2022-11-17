import { useEffect, useState } from 'react';

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
import { useBlockProps, InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import App from './App';
import { loadFamily } from './mylib/Connect';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes  }) {
	const { align, founder, founderFAB, textColor, backgroundColor, foregroundColor, highlightColor, selectionColor } = attributes;
  const [families, setFamilies] = useState([]);
	const [relations, setRelations] = useState([]);
	const [persons, setPersons] = useState([]);

	useEffect(() => {
      window.dispatchEvent(new Event('resize'));
	}, [align]);

	useEffect(() => {
	  const fetchData = async () => {
      try {
			  const data = await loadFamily();
				setPersons(data.persons);
				setRelations(data.relations);

				const founders = data.persons.filter((p)=> p.root).map((p) => p.id);
				setFamilies(founders);
			} catch(err) {
				console.log(err);
			}
	  };

	  fetchData().catch(console.error);
	}, [founder]);

	function getFamiliesOptions() {
	  const familyRoots = persons.filter((p) => p.root === true);
	  return familyRoots.map((r) => ({ label: `${r.firstName} ${r.lastName}`, value: r.id })); 
	}

	if (!persons || !families) {
		return null;
	}

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody
				  title={ __('General Settings') }
					initialOpen={ true }
				>
				  <SelectControl
  			    label={ __( 'Current founder', 'pedigree' ) }
	  				labelPosition= 'side'
            value={ parseInt(founder) }
            onChange={ ( f ) => setAttributes({ founder: parseInt(f) }) }
				  	options={ getFamiliesOptions() }
					/>
          <ToggleControl
  			    label={ __( 'Show founder FAB', 'pedigree' ) }
	  				labelPosition= 'side'
            checked={ founderFAB }
            onChange={ () => setAttributes({ founderFAB: !founderFAB }) }
					/>
				</PanelBody>
				<PanelColorSettings 
					title={__('Color settings')}
					colorSettings={[
						{
							value: backgroundColor,
							onChange: (c) => setAttributes({ backgroundColor: c }),
							label: __("Background Color"),
						},
						{
							value: textColor,
							onChange: (c) => setAttributes({ textColor: c }),
							label: __('Text color')
						},
						{
							value: foregroundColor,
							onChange: (c) => setAttributes({ foregroundColor: c }),
							label: __("Foreground Color"),
						},
						{
							value: highlightColor,
							onChange: (c) => setAttributes({ highlightColor: c }),
							label: __("Highlight Color"),
						},
						{
							value: selectionColor,
							onChange: (c) => setAttributes({ selectionColor: c }),
							label: __("Selection Color"),
						},
					]}
				/>
			</InspectorControls>
			<div style={
			  { position: 'relative',
			    minHeight: '640px',
			  }}
			>
			  <App
				  founder={ founder }
					families={ families }
					persons={ persons }
					relations={ relations }
					founderFAB={ founderFAB }	
					readonly={ true }
                    text={ textColor }
					background={ backgroundColor }
					foreground={ foregroundColor }
					highlight={ highlightColor }
					selection={ selectionColor }
				/>
		  </div>
		</div>
	);
}
