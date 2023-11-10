<?php

function famtree_form_read_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input readonly type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
  </tr>  
  <?php
}

function famtree_form_text_field($name, $label) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input type="text" name="<?php print ($name) ?>" id="<?php print ($name) ?>" /></td>
  </tr>  
  <?php
}

function famtree_form_date_field($name, $label, $callback = NULL, $disabled = NULL) {
  ?>
  <tr>
    <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
    <td><input type="date" name="<?php print ($name) ?>" <?php if(isset($callback)) print('onchange="window.famtree.' . $callback . '()"') ?> min="1700-01-01" id="<?php print ($name) ?>" <?php if(isset($disabled)) print('disabled="disabled"') ?> /></td>
  </tr>
  <?php
}

function famtree_form_select_field($name, $label, $callback = NULL, $options = NULL, $rmCb = NULL) {
  ?>
  <td><label for="<?php print ($name) ?>"><?php print ($label) ?>:</label></td>
  <td><div class="famtree-form__flex">
    <select autocomplete name="<?php print ($name) ?>" <?php if(isset($callback)) print('onchange="window.famtree.' . $callback . '()"') ?> id="<?php print ($name) ?>" class="famtree-form__data" disabled="disabled">
    <?php
      if(isset($options)) {
        foreach ($options as $option) {
          ?><option value="<?php print ($option) ?>"><?php echo __($option, 'famtree') ?></option><?php
        }
      }
    ?>
    </select>
    <?php if(isset($rmCb)) {
      render_remove_button($rmCb, $name);
    } ?>
  </div></td>
  <?php
}

function famtree_render_page_title($title) {
  ?>
  <h1><?php print(esc_html($title)) ?></h1>
  <?php
}

function famtree_render_section_title($title) {
  ?>
  <h2><?php print(esc_html($title)) ?></h2>
  <?php
}

function famtree_render_legend($text) {
  ?>
  <legend><h4><?php print(esc_html($text)) ?></h4></legend>
  <?php
}

function render_remove_button($callback, $prefix) {
  ?>
  <button disabled="disabled" type="button" onclick="window.famtree.<?php echo $callback ?>()" class="button icon" <?php if(isset($prefix)) print('name="' . $prefix . '_remove"') ?>>
    <span title="<?php echo __('remove', 'famtree') ?>" class="dashicons dashicons-trash"></span>
  </button>
  <?php
}

function famtree_render_persons_listing() {

  // Creating an instance
  $personsTable = new Persons_List_Table();

  echo '<div class="wrap">';
  // Prepare table
  $personsTable->prepare_items();

  ?>
  <form method="post">
    <input type="hidden" name="page" value="famtree" />
    <?php $personsTable->search_box('search', 'search_id'); ?>
  </form>
<?php

  // Display table
  $personsTable->display();
  echo '</div>';
}

function famtree_render_public_access() {
  $public_access = get_option('famtree_public_access');
  ?>
  <input name="famtree_public_access" type="checkbox" id="famtree_public_access" <?php ($public_access ? _e('checked') : '') ?> >
  <label for="famtree_public_access"><?php _e( 'On the published page the data of the family trees can be read without login. Usefull for trees that should be visible to the public.', 'famtree' ); ?></label>
  <?php
}

function famtree_render_global_settings() {
  // currently nothing to render
}

function famtree_render_edit_person_form() {
  ?>
  <div style="display: flex;">
    <div>
    <form method="post" action="javascript:;" onsubmit="window.famtree.saveAll()" id="editPersonForm" class="form famtree-form">
      <input readonly hidden type="text" name="id" id="personId" />
      <div class="famtree-form__flex">
        <fieldset>
        <?php famtree_render_legend(__('Attributes', 'famtree')) ?>
          <table>
            <?php
            famtree_form_text_field('firstName', __('First name', 'famtree'));
            famtree_form_text_field('surNames', __('Sur names', 'famtree'));
            famtree_form_text_field('lastName', __('Last name', 'famtree'));
            famtree_form_text_field('birthName', __('Birth name', 'famtree'));
            famtree_form_date_field('birthday', __('Birthday', 'famtree'));
            famtree_form_date_field('deathday', __('Date of death', 'famtree'));
            ?>
          </table>
        </fieldset>
        <fieldset name="fs_relations" disabled="disabled">
        <?php famtree_render_legend(__('Relations', 'famtree')) ?>
          <table>  
            <tr>
              <?php famtree_form_select_field('partners', __('Partners', 'famtree'), 'partnerSelected', NULL, 'removePartner') ?>
            </tr>
            <tr>
              <?php famtree_form_select_field('children', __('Children', 'famtree'), NULL, NULL, 'removeChild') ?>
            </tr>
            <?php
            famtree_form_date_field('relStart', __('Begin', 'famtree'), 'relMetaChanged', TRUE);
            famtree_form_date_field('relEnd', __('End', 'famtree'), 'relMetaChanged', TRUE);
            ?>
            <tr>
              <?php famtree_form_select_field('relType', __('Kind of', 'famtree'), 'relMetaChanged', ['marriage', 'partnership']) ?>
            </tr>
            <tr>
              <td><br/></td>
            </tr>
            <tr>
              <?php famtree_form_select_field('candidates', __('Add person', 'famtree')) ?>
            </tr>
            <tr>
              <td>
              </td>
              <td>
                <button type="button" name="btn_addChild" disabled="disabled" onclick="window.famtree.addChild()" class="button famtree-form__button"><?php echo __('As child', 'famtree') ?></button>
                <button type="button" onclick="window.famtree.addPartner()" class="button famtree-form__button"><?php echo __('As partner', 'famtree') ?></button>
              </td>
            </tr>
           </table>
        </fieldset>
        <fieldset name="fs_portrait" disabled="disabled">
          <input hidden id="portraitId" type="text" name="portraitId" class="form"/>
          <?php famtree_render_legend(__('Portrait foto', 'famtree')) ?>
          <table>  
            <tr>
              <td>
                <?php printf(
                '<img src="%1$s" id="person-portrait" width="100" height="100" style="object-fit: cover"/>',
                  plugins_url( '../../admin/images/default.jpg', __FILE__ )
                );?>
              </td>
            </tr>
            <tr>
              <td>
                <input id="portrait-upload-button" type="button" class="button" value="<?php echo __('Select image', 'famtree') ?>" />
              </td>
            </tr>
          </table>
        </fieldset>
      </div>
      <fieldset class="submit" name="fs_buttons" disabled="disabled">
        <button type="button" onclick="window.famtree.resetPerson()" class="button famtree-form__button"><?php echo __('Reset person', 'famtree') ?></button>
        <button type="button" onclick="window.famtree.deletePerson()" class="button famtree-form__button"><?php echo __('Remove person', 'famtree') ?></button>
        <button id="person-submit"  type="submit" value="Submit" class="button button-primary famtree-form__button"><?php echo __('Save person', 'famtree') ?></button>
      </fieldset>
      </form>
    </div>
    <div class="famtree-metadata-container">
      <?php famtree_render_legend(__('Additional files', 'famtree')) ?>
      <div class="famtree-metadata-container__list">
        <table class="wp-list-table striped widefat toplevel_page_famtree">
          <thead>
            <th scope="col"><?php echo __('Preview', 'famtree') ?></th>
            <th scope="col"><?php echo __('Name', 'famtree') ?></th>
            <th scope="col"><?php echo __('Description', 'famtree') ?></th>
            <th scope="col"></th> 
            <th scope="col"></th> 
          </thead>
          <tbody  id="existingMetadata">
            <td colspan="5" class="column-nocontent"><?php echo __('No files found', 'famtree') ?></td>
          </tbody>
        </table>
      </div>
      <div>
        <form method="post" id="uploadMetadataForm" action="javascript:;" class="form famtree-form">
          <fieldset class="last" disabled="disabled" name="fs_add">
            <input hidden id="upload-metadata-refid" type="text" name="refid" />
            <table>
              <tr>
                <td>
                  <input id="upload-metadata-button" type="button" class="button" value="<?php echo __('Add metadata', 'famtree') ?>"/>
                </td>
              </tr>
            </table>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
  <?php
}

function famtree_render_runtime_message() {
  ?>
    <div id="famtree-message" class="notice is-dismissible famtree-hidden">
      <p class="famtree-message__text"></p>
      <button type="button" class="notice-dismiss" onclick="window.famtree.hideMessage()">
        <span class="screen-reader-text"><?php print __('Dismiss this notice.', 'famtree') ?></span>
      </button>
    </div>
  <?php
}

function famtree_render_success_feedback($message) {
  ?>
  <div class="notice notice-success is-dismissible">
      <p><?php echo $message; ?></p>
  </div>
  <?php
}

function famtree_render_error_feedback($message) {
  ?>
  <div class="notice notice-error is-dismissible">
      <p><?php print __('Error', 'famtree'); echo ': '; echo $message; ?></p>
  </div>
  <?php
}
