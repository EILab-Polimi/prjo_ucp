<?php

namespace Drupal\prjo_ucp_analysis\Plugin\Field\FieldFormatter;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\Html;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Component\Serialization\Json as Json;


/**
 * Plugin implementation of the 'openlayers_default' formatter.
 *
 * @FieldFormatter(
 *   id = "analysis_formatter_default",
 *   label = @Translation("Analysis"),
 *   field_types = {
 *     "jsonb",
 *     "json",
 *   }
 * )
 */
class AnalysisDefaultFormatter extends FormatterBase implements ContainerFactoryPluginInterface {


  /**
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
  * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
  * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
  * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
  */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, $label, $view_mode, array $third_party_settings, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);
    $this->entityManager = $entity_type_manager;
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
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      // Add any services you want to inject here
      $container->get('entity.manager')
    );
  }


  /**
     * {@inheritdoc}
     */
    public function viewElements(FieldItemListInterface $items, $langcode) {
      $elements = [];

      // Say - global values
      $host = \Drupal::request()->getSchemeAndHttpHost();
      $storage = \Drupal::service('entity_type.manager')->getStorage('node');
      //print($host);
      // kint($items);
      // dpm($items);
      // Load Analysis specification

      // $an_spec_entity_ids = $storage->getQuery()
      //   ->condition('type', 'analysis_specification')
      //   ->condition('status', 1)
      //   ->execute();
      //
      // $an_spec_entities = $storage->loadMultiple($an_spec_entity_ids);
      //
      // foreach ($an_spec_entities as $key => $value) {
      //   $field = $value->get('field_analysis_elements')->getValue();
      //   // dpm($field);
      // }
      //
      // // Get Analysis template from selected analysis specification
      // $spec = Json::decode($field[0]['value']);
      // dpm($spec);

      // Fix for file_get_contents in https
      $arrContextOptions=array(
        "ssl"=>array(
          "verify_peer"=>false,
          "verify_peer_name"=>false,
        ),
      );

      // Convert machine names to human names
      // mapping enum values to enum titles to be shown
      $uom = file_get_contents($host."/api/json/uom", false, stream_context_create($arrContextOptions));
      $uomData = Json::decode($uom);
      //print('Uom data \n');
      //print($uomData);
      $obs = file_get_contents($host."/api/json/obsp", false, stream_context_create($arrContextOptions));
      $obsData = Json::decode($obs);
      // dpm($obsData['enumSource'][0]['source']);

      $rows = [];
      foreach ($items as $delta => $item) {
        // Edit and save node to see this dump
        // dpm($item->value);
        // Each $item->value contains a json array of object
        $array = Json::decode($item->value);
        // dpm($array);
         // 0 - [ {uom: "ug/L", value: 2, observed property: "Al"} ]

        // Set classes for elements rows
        foreach ($array as $key => $value) {
          $obs_key = array_search($value['observed property'], array_column($obsData['enumSource'][0]['source'], 'code'));
          // dpm( array_search($value['observed property'], array_column($obsData['enumSource'][0]['source'], 'code')) );
          // dpm($obs_key);
          $uom_key = array_search ($value["uom"], array_column($uomData['enumSource'][0]['source'], 'code'));
          $value['obs_name'] = $obsData["enumSource"][0]["source"][$obs_key]['printSymbol'];
          $value['uom'] = $uomData["enumSource"][0]["source"][$uom_key]['symbol'];

          $rearrange = ['1' => $value['obs_name'], '2' => $value['value'], '3' => $value['uom']];
          $rows[] = [
            // 'data' => $value,
            'data' => $rearrange,
            'class' => ['row-' . $value['observed property']],
          ];
        }

	// print_r($rows);
        // $plotly = [
        //   '#markup' => '<div id="radialplotly"></div>',
        // ];

        $elements[$delta] = [
        [
          '#markup' => '<div id="radialplotly"></div>',
        ],
        [
          '#theme' => 'table',
          '#attributes'=> ['id' => 'pistable'],
          '#header' => array(t('Observed property'),t('Value'),t('UOM')),
          '#rows' => $rows,
          // '#rows' => $array,
          // '#langcode' => $item->getLangcode(),
          '#attached' => [
            'library' => [
               'prjo_ucp_analysis/mathjs',
               'prjo_ucp_analysis/InitMathjs',
               'prjo_ucp_analysis/plotly',
             ],
             'drupalSettings' => [
               'MathJs' => [ 'data' => $array,
                             // 'spec' => $spec,
                           ],
             ],
           ]
        ]]
        ;
      }
      // dpm($elements);
      return $elements;
    }

  // /**
  //  * {@inheritdoc}
  //  *
  //  * This function is called from parent::view().
  //  */
  // public function viewElements(FieldItemListInterface $items, $langcode) {
  //   // $settings = $this->getSettings();
  //   $map = openlayers_get_map($settings['openlayers_map']);
  //   $mapid = Html::getUniqueId('openlayers_map');
  //   $elements = [];
  //   $features = [];
  //   foreach ($items as $delta => $item) {
  //
  //     $feature = [];
  //     //$feature['geom'] = openlayers_process_geofield($item->value);
  //     $feature['geom'] = $item->value;
  //     array_push($features, $feature);
  //     $elements[$delta] = openlayers_render_map($mapid, $map, $features, FALSE);
  //   }
  //   return $elements;
  // }

}
