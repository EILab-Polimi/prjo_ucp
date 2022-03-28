<?php

namespace Drupal\prjo_ucp_analysis\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Component\Serialization\Json;

/**
 * Implementing our example JSON api.
 */
class OPJsonApiController {

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
    $op_entity_ids = $storage->getQuery()
      ->condition('type', 'observed_property')
      ->condition('status', 1)
      ->execute();

    $op_entities = $storage->loadMultiple($op_entity_ids);

    foreach ($op_entities as $key => $value) {
      $field_op = $value->get('field_observed_property')->getValue();
    }

    // dpm($field_op[0]['value']);
    $decoded = Json::decode($field_op[0]['value']);

    usort($decoded,function($first,$second){
      return strtolower($first['code']) > strtolower($second['code']);
    });
    // dpm($decoded);

    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();

    $enumSource = [];
    $enumSource[] = [ "none" => none,
                      "source" => $decoded,
                      "title" => "{{item.printSymbol}} {{item.label.$language}}",
                      "value" => "{{item.code}}"
                    ];

    return ['$id' => 'http://local.d8mapping.it/api/json/obsp',
            "enumSource" => $enumSource
           ];

  }

}
