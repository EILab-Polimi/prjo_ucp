<?php

namespace Drupal\prjo_ucp_analysis\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\Html;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Component\Serialization\Json as Json;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;

/**
 * Plugin implementation of the 'geofield_OpenLayersInputWidget' widget.
 *
 * @FieldWidget(
 *   id = "analysis_field_widget",
 *   label = @Translation("Analysis"),
 *   field_types = {
 *     "jsonb",
 *     "json",
 *   }
 * )
 */
class AnalysisInputWidget extends WidgetBase implements ContainerFactoryPluginInterface {
// class AnalysisInputWidget extends StringTextareaWidget implements ContainerFactoryPluginInterface {

  /**
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
  * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
  * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
  * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
  */

  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings'],
      $container->get('entity_type.manager'),
      // $container->get('geofield.geophp')
    );
  }

  /**
   * Gives a visual Table to save Analysis.
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    // Set an unique id for thr json-editor element
    $id = uniqid('jsoneditor');
    // Set variables from widget settings
    $hidden = ($this->getSetting('showJson') ? 'visually-hidden' : '');
    $element['#title_display'] = ($this->getSetting('showJson') ? 'invisible' : $element['#title_display']);

    // This is the jsonb textbox where store json from the json-editor
    $widget['value'] = $element + [
      '#type' => 'textarea',
      '#default_value' => $items[$delta]->value,
      // '#default_value' => $items[$delta]->value ?: NULL,
      '#attributes' => [
        'class' => ['js-editor', 'js-text-full','text-full', $hidden ],
        // 'hidden' => [$this->getSetting('showJson')]
        // 'id' => $mapid.'-wktbox'
      ],
      '#attached' => [
        'library' => [
           'prjo_ucp_analysis/json-editor',
           'prjo_ucp_analysis/InitJsonEditor'
         ],
         'drupalSettings' => [
           'json-editor' => [ //'title' => $element->getTitle(),
                             'value' => $items[$delta]->value,
                             'schema' => $this->getSetting('schema'),
                             'show_errors' => $this->getSetting('show_errors'),
                             // 'id' => 'element id',
                             'test' => $id,
                             'disable_array_add' => $this->getSetting('disable_array_add'),
                             'disable_array_delete' => $this->getSetting('disable_array_delete'),
                             'disable_array_delete_all_rows' => $this->getSetting('disable_array_delete_all_rows'),
                             'disable_array_delete_last_row' => $this->getSetting('disable_array_delete_last_row'),
                             'disable_array_reorder' => $this->getSetting('disable_array_reorder'),
                             'enable_array_copy' => $this->getSetting('enable_array_copy'),
                             'disable_collapse' => $this->getSetting('disable_collapse'),
                             'object_layout' => $this->getSetting('object_layout'),
                             'iconlib' => $this->getSetting('iconlib'),
                             'remove_button_labels' => $this->getSetting('remove_button_labels'),
                             'disable_edit_json' => $this->getSetting('disable_edit_json'),
                             'disable_properties' => $this->getSetting('disable_properties'),
                             'no_additional_properties' => $this->getSetting('no_additional_properties'),
                            ],
         ],
       ],
     ];

    // This is the markup with id cstmjsoneditor that will be the json-editor
    // initialized element

    $widget['editor'] =array(
      '#markup' => '<div id="cstmjsoneditor"></div>',
    );

    // TODO since in js side we use $('#cstmjsoneditor', context).once('InitJsonEditor')
    // The cstmjsoneditor id must exist
    // $widget['editor'] =array(
    //   '#markup' => '<div id="'.$id.'"></div>',
    // );
    // $widget = parent::formElement($items, $delta, $element, $form, $form_state);
    $widget['#element_validate'][] = [static::class, 'validateJsonStructure'];
    return $widget;
    // return $widget_table;
  }

  /**
     * Validates the input to see if it is a properly formatted JSON object.
     *
     * If not, PgSQL will throw fatal errors upon insert.
     *
     * @param array $element
     *   The form element.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     *   The form state.
     */
    public static function validateJsonStructure(array &$element, FormStateInterface $form_state) {
      if (mb_strlen($element['value']['#value'])) {
        Json::decode($element['value']['#value']);

        if (json_last_error() !== JSON_ERROR_NONE) {
          $form_state->setError($element['value'], new TranslatableMarkup('Field "@name" must contain a valid JSON object. Error: %error', [
            '@name' => $element['#title'],
            '%error' => json_last_error_msg(),
          ]));
        }
      }
    }

  /**
  * {@inheritdoc}
  */
  public static function defaultSettings() {
    return [
      'schema' => '{}',
      'showJson' => false,
      'show_errors' => "interaction",
      'disable_array_add' => false,
      'disable_array_delete' => false,
      'disable_array_delete_all_rows' => false,
      'disable_array_delete_last_row' => false,
      'disable_array_reorder' => false,
      'enable_array_copy' => false,
      'disable_collapse' => false,
      'object_layout' => "normal",
      'iconlib' => "null",
      'remove_button_labels' => false,
      'disable_edit_json' => false,
      'disable_properties' => false,
      'no_additional_properties' => false,
    ] + parent::defaultSettings();
  }

  /**
  * {@inheritdoc}
  */
  public function settingsForm(array $form, FormStateInterface $form_state) {

    $config = $this->fieldDefinition;

    $elements = parent::settingsForm($form, $form_state);

    $elements['schema'] = [
      '#title' => $this->t('Json-editor schema'),
      '#type' => 'textarea',
      '#default_value' => $this->getSetting('schema'),
      '#required' => TRUE,
    ];

    $elements['show_errors'] = [
      '#type' => 'select',
      '#title' => $this->t('When to show validation errors in the UI.'),
      '#options' => array("interaction" => "interaction",
                          "change" => "change",
                          "always" => "always",
                          "never" => "never"),
      '#default_value' => $this->getSetting('show_errors'),
    ];

    $elements['showJson'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide input value box'),
      // '#attributes' => ['id' => ['openlayers-map-showbox']],
      '#default_value' => $this->getSetting('showJson'),
    ];

    // Array
    $elements['disable_array_add'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide "add row" buttons from arrays'),
      '#default_value' => $this->getSetting('disable_array_add'),
    ];
    $elements['disable_array_delete'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide "delete row" buttons from arrays'),
      '#default_value' => $this->getSetting('disable_array_delete'),
    ];
    $elements['disable_array_delete_all_rows'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide "delete all rows" buttons from arrays'),
      '#default_value' => $this->getSetting('disable_array_delete_all_rows'),
    ];
    $elements['disable_array_delete_last_row'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide "delte last row" buttons from arrays'),
      '#default_value' => $this->getSetting('disable_array_delete_last_row'),
    ];
    $elements['disable_array_reorder'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Hide "move up" and "move down" buttons from arrays'),
      '#default_value' => $this->getSetting('disable_array_reorder'),
    ];
    $elements['enable_array_copy'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Add copy buttons to arrays'),
      '#default_value' => $this->getSetting('enable_array_copy'),
    ];

    $elements['disable_collapse'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Remove all collapse buttons from objects and arrays'),
      '#default_value' => $this->getSetting('disable_collapse'),
    ];

    $elements['object_layout'] = [
      '#type' => 'select',
      '#title' => $this->t('The default value of "format" for objects'),
      '#options' => array("normal" => "normal", "table" => "table", "grid" => "grid"),
      '#default_value' => $this->getSetting('object_layout'),
    ];

    $elements['iconlib'] = [
      '#type' => 'select',
      '#title' => $this->t('The icon library to use for the editor'),
      '#options' => array("null" => "null",
                          "jqueryui" => "jqueryui",
                          "fontawesome3" => "fontawesome3",
                          "fontawesome4" => "fontawesome4",
                          "fontawesome5" => "fontawesome5",
                          "openiconic" => "openiconic",
                          "spectre" => "spectre"),
      '#default_value' => $this->getSetting('iconlib'),
    ];
    $elements['remove_button_labels'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Display only icons in buttons. This works only if iconlib is set.'),
      '#default_value' => $this->getSetting('remove_button_labels'),
    ];

    $elements['disable_edit_json'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Remove all Edit JSON buttons from objects.'),
      '#default_value' => $this->getSetting('disable_edit_json'),
    ];
    $elements['disable_properties'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Remove all Edit Properties buttons from objects.'),
      '#default_value' => $this->getSetting('disable_properties'),
    ];
    $elements['no_additional_properties'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Objects can only contain properties defined with the properties keyword unless the property additionalProperties: true is specified in the object schema.'),
      '#default_value' => $this->getSetting('no_additional_properties'),
    ];


    return $elements;
  }

  /**
  * {@inheritdoc}
  */
  // public function settingsSummary() {
  //   $map = openlayers_get_map($this->getSetting('openlayers_map'));
  //   //$map = openlayers_get_map('dasdassda');
  //   $summary = [];
  //   if(isset($map['label'])) {
  //     $summary[] = $this->t('OpenLayers MAP: @map', ['@map' => $this->t($map['label'])]);
  //   } else {
  //     $summary[] = $this->t('none map is configured or configured map is still missing');
  //   }
  //   return $summary;
  // }

  /**
  * {@inheritdoc}
  */
  // public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
  //   $geophp = $this->geoPHP;
  //   foreach ($values as $delta => $value) {
  //     if ($geom = $geophp->load($value['value'])) {
  //       $values[$delta]['value'] = $geom->out('wkt');
  //     }
  //   }
  //   return $values;
  // }
}
