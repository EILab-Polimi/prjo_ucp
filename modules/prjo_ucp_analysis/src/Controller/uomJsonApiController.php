<?php

namespace Drupal\prjo_ucp_analysis\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Component\Serialization\Json;

/**
 * Implementing our example JSON api.
 */
class uomJsonApiController {

  /**
   * Callback for the API.
   */
  public function renderApi() {

    // return new JsonResponse([
    //   'data' => $this->getResults(),
    //   'method' => 'GET',
    // ]);
    // return new JsonResponse(
    //   $this->getResults()
    // );

    // return new JsonResponse([
    //   '$id' => 'http://local.d8mapping.it/api/json/uom',
    //   // 'description' => $this->getDescription(),
    //   'enum'=> $this->getResults()
    //   ]
    // );
    return new JsonResponse(
      $this->getResults()

    );
  }

  /**
   * A helper function returning results.
   */
  public function getResults() {
    $storage = \Drupal::service('entity_type.manager')->getStorage('node');
    // $node = node_load(279);
    $uom_entity_ids = $storage->getQuery()
      ->condition('type', 'units_of_measure')
      ->condition('status', 1)
      ->execute();

    $uom_entities = $storage->loadMultiple($uom_entity_ids);

    foreach ($uom_entities as $key => $value) {
      $field_uom = $value->get('field_units_of_measure')->getValue();
    }

    $decoded = Json::decode($field_uom[0]['value']);
    // dpm($decoded);

    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();

    $enumSource = [];
    $enumSource[] = [ "none" => none,
                      "source" => $decoded,
                      "title" => "{{item.symbol}} {{item.label.$language}}",
                      "value" => "{{item.code}}"
                    ];

    return ['$id' => 'http://local.d8mapping.it/api/json/obsp',
            "enumSource" => $enumSource
           ];

  }

}
