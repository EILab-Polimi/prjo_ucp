<?php

namespace Drupal\prjo_ucp_analysis\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Component\Serialization\Json;

/**
 * Implementing our example JSON api.
 */
class rangeJsonApiController {

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

    $str = '{
  "container": {
    "type": "object",
    "options": {
      "grid_columns": 12
    },
    "format": "grid-strict",
    "properties": {
      "minsign": {
        "type": "string",
        "title": "Min",
        "format": "radio",
        "enum": [
          "minimum",
          "exclusiveMinimum"
        ],
        "options": {
          "enum_titles": [
            "≤",
            "<"
          ],
          "grid_columns": 3
        }
      },
      "minvalue": {
        "title": "value",
        "default": null,
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "options": {
          "grid_columns": 3
        }
      },
      "maxsign": {
        "type": "string",
        "title": "Max",
        "format": "radio",
        "enum": [
          "maximum",
          "exclusiveMaximum"
        ],
        "options": {
          "enum_titles": [
            "≥",
            ">"
          ],
          "grid_columns": 3
        }
      },
      "maxvalue": {
        "title": "value",
        "default": null,
        "anyOf": [
          {
            "type": "number"
          },
          {
            "type": "null"
          }
        ],
        "options": {
          "grid_columns": 3
        }
      }
    }
  }
}';

    // dpm($str);
    $arr = Json::decode($str);

    // dpm($arr);

    return ['$id' => 'http://local.d8mapping.it/api/json/range',
            'format' => 'grid',
            'properties' => $arr
           ];

  }

}
