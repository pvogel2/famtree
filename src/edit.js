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
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';

import { PanelBody, SelectControl, ToggleControl, ColorPicker } from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import App from './App';
import { loadFamily } from './lib/Connect';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/block-edit-save/#edit
 *
 * @return {WPElement} Element to render.
 */
export default function Edit({ attributes, setAttributes  }) {
	const { align, family, familyFAB, backgroundColor } = attributes;

	const [families, setFamilies] = useState([]);
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
				<PanelBody title="Attribute Settings" initialOpen={ true }>
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
				<PanelBody title="Background Color" initialOpen={ false }>
	        <ColorPicker
					  label={ __( 'Show family FAB', 'pedigree' ) }
            color={ backgroundColor }
            onChange={ (c) => setAttributes({ backgroundColor: c }) }
            defaultValue="#000000"
          />
				</PanelBody>
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
					familyFAB={ familyFAB }
					background={ backgroundColor }
				/>
		  </div>
		</div>
	);
}
