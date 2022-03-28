<?php

namespace Drupal\prjo_ucp_analysis\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\Component\Serialization\Json;

/**
 * Implementing our example JSON api.
 */
class i18nJsonApiController {

  /**
   * Callback for the API.
   */
  public function renderApi() {

    return new JsonResponse(
      $this->getResults()
    );

  }

  /**
   * A helper function returning results.
   */
  public function getResults() {
    $languages = \Drupal::languageManager()->getStandardLanguageList();

    // dpm($languages);

    foreach ($languages as $key => $value) {
      $properties[$key] = array("type" => "string", "title" => $value[0]);
    }
    return ['$id' => 'http://local.d8mapping.it/api/json/i18n',
            "properties" => $properties,
            // "format" => "select", // Sembra non funzionare
            "defaultProperties" => ["en", "it"]
           ];
  }

}
