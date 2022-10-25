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
	const { align, family, familyFAB, textColor, backgroundColor, foregroundColor, highlightColor } = attributes;

	const [families, setFamilies] = useState([]);
	const [relations, setRelations] = useState([]);
	const [persons, setPersons] = useState([]);

	useEffect(() => {
      window.dispatchEvent(new Event('resize'));
	}, [align]);

	useEffect(() => {
	  if (!family) {
	    return;
	  }

	  const fetchData = async () => {
      try {
			  const data = await loadFamily(family);
				setFamilies(data.families);
				setPersons(data.persons);
				setRelations(data.relations);
			} catch(err) {
				console.log(err);
			}
	  };

	  fetchData().catch(console.error);
	}, [family]);

	function getFamiliesOptions() {
	  return families.map((value) => {
	    return { label: value, value };
	  });
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
  			    label={ __( 'Current family', 'pedigree' ) }
	  				labelPosition= 'side'
             value={ family }
             onChange={ ( f ) => setAttributes({ family: f }) }
				  	options={ getFamiliesOptions() }
					/>
          <ToggleControl
  			    label={ __( 'Show family FAB', 'pedigree' ) }
	  				labelPosition= 'side'
            checked={ familyFAB }
            onChange={ () => setAttributes({ familyFAB: !familyFAB }) }
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
					]}
				/>
			</InspectorControls>
			<div style={
			  { position: 'relative',
			    minHeight: '640px',
			  }}
			>
			  <App
				  family={ family }
					families={ families }
					persons={ persons }
					relations={ relations }
					familyFAB={ familyFAB }
					readonly={ true }
          text={ textColor }
					background={ backgroundColor }
					foreground={ foregroundColor }
					highlight={ highlightColor }
				/>
		  </div>
		</div>
	);
}
