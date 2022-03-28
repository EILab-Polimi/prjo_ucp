# New

> Bolded we have the content types. Italic we have the contents. code style for fields in a content type

We'll create a vocabulary **Water application field** that is referenced from
- **Analysis specification** content type
  - 1 field ref for `Water application field` vocabulary
  - 1 field ref a `Countries` vocabulary
  - 1 json scheleton (Parameter/uom/min-max) - [Parameters names and translations]
  - 1 Description (Law)
- **Water stream** content type
  - 1 field ref for `Water application field` da cui possiamo inerire il json scheleton della _Analysis specification_ related to the same `Water application field` and filtered by `Country` given the Water stream position

- **Technology product** content type
   Eg. of operational tecnology
   reduce from 400 μg/L to 10 μg/L at a rate of 500 L/sec

```
{
  "type": "array",
  "format": "table",
  "title": "Characteristics",
  "uniqueItems": true,
  "items": {"type": "object",
            "properties": {
              "observed property": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/obsp"
              },
              "uom": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/uom"
               },
               "influent": {
                  "type" : "object",
                  "properties": {
                      "color": {
                        "type": "string",
                        "format": "color"
                      }
                    }
             },
             "effluent": {
                "type" : "object",
                "properties": {
                              "minimum": {"type": "number"},
                              "exclusiveMinimum": {"type": "number"},
                              "maximum":{"type":"number"},                           
                              "exclusiveMaximum": {"type": "number"}
                            }
           }

   }
}
}
```

There is an issue https://github.com/json-editor/json-editor/issues/949

## json-editor

To build the json-editor from sources NOT build it from the libraries folder of dural since some drupal files broke the build, `/var/www/html/d8mapping/web/core/.eslintrc.json` is the one who affect the build.

Set the environment to build - node v14.16.0 from nvm - npm v7.10.0.

From a shell switch nvm to use node 14.16.0

```
$ nvm use 14.16.0
```

To check the npm version run `npm --version` to upgrade npm to the latest version run `$ nvm install-latest-npm`

Then clone the repo in the home directory. And then run
```
$ npm install
```
to install and build or
```
$ npm run build
```
to just build

The compiled `jsoneditor.js` file is in the `dist` directory. Copy it to `libraries/json-editor` directory of the drupal installation.

### Large arrays
Management for big elements here https://github.com/jdorn/json-editor/wiki/Handle-Large-Arrays-with-the-JSON-editor

## Unit of measure
We'll use the math.js library for calculation/conversion between unit of measure refer to this link to get a list of built-in unit of measures and prefixes
https://mathjs.org/docs/datatypes/units.html#reference

Crete a custom uom https://mathjs.org/docs/datatypes/units.html#create-several-units-at-once  

- **Turbidity** is measured in _Nephelometric Turbidity Units_ (NTU)

------
<table class="csvtable" id="csvtable"><tbody><tr><td><b>FIELD NAME</b></td><td>ENTITY TYPE</td><td>	FIELD TYPE</td><td>	USED IN</td></tr>
<tr><td>field_country</td><td>node</td><td>Country (module: address)</td><td>Analysis specification</td></tr>
<tr><td>field_geometry_data_geometry</td><td>taxonomy_term</td><td>Geolocation Geometry - Geometry (module: geolocation_geometry)</td><td>Countries</td></tr></tbody></table>
Adding terms to the vocabulary automatically will make the Application field select box grow.

**Water application field**
  - 1 Label (Agricolture, Human usage water ...)

[Parameters names and translations] - I parametri verranno salvati col simbolo chimico in modo da omogeneizzare le eventuali traduzioni (ad esempio micro **siemens** viene tradotto in Conducibilità (italiano) Conductivity (English)). !!! Translation service in base alla uom implica che Parameter potrebbe anche non essere specificato.

<table class="csvtable" id="csvtable"><tbody><tr><td><b>Observed Property</b></td><td>parametri indicati dalla delibera ARERA n°586/2012/R/IDR - Allegato 3 </td><td>PH</td><td>Residuo Fisso a 180°C</td><td>Durezza</td><td>Conducibilità</td><td>Calcio</td><td>Magnesio</td><td>Ammoniaca</td><td>Cloruri</td><td>Solfati</td><td>Potassio</td><td>Sodio</td><td>Arsenico</td><td>Bicarbonato</td><td>Cloro residuo  </td><td>Fluoruri</td><td>Nitrati</td><td>Nitriti</td><td>Manganese</td></tr><tr class="rowshow" style="display: table-row;"><td><b>UOM</b></td><td>unità di misura</td><td>unità pH</td><td>mg/l</td><td>°F</td><td>μS/cm</td><td>mg/l Ca</td><td>mg/l Mg</td><td>mg/l NH₄</td><td>mg/l Cl</td><td>mg/l SO₄</td><td>mg/l K</td><td>mg/l Na</td><td>μg/l As</td><td>mg/l HCO₃</td><td>mg/l Cl₂</td><td>mg/l F</td><td>mg/l NO₃</td><td>mg/l NO₂</td><td>μg/l Mn</td></tr><tr class="rowshow" style="display: table-row;"><td></td><td>valore di parametro
D.Lgs 31/2001</td><td>9,5</td><td></td><td></td><td>2500</td><td></td><td></td><td>0,5</td><td>250</td><td>250</td><td></td><td>200</td><td>10</td><td></td><td></td><td>1,5</td><td>50</td><td>0,5</td><td>50</td></tr><tr class="rowshow" style="display: table-row;"><td>COMUNE</td><td>punto di prelievo</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr class="rowshow" style="display: table-row;"><td>Albavilla</td><td>Fontanella Via XXV Aprile</td><td>7,6</td><td>316</td><td>19,5</td><td>441</td><td>68</td><td>6</td><td>&lt;0,06</td><td>7,2</td><td>10</td><td>&lt;1,00</td><td>4</td><td>&lt;1,00</td><td>202</td><td></td><td>&lt;0,20</td><td>10</td><td>&lt;0,10</td><td>1</td></tr></tbody></table>
Conductivity | siemens | μS/cm

## Json schema

Una lista di UOM con le definitions - le ricaviamo come array da
  - Json:api web service di drupal (Non sembra così immediato)
  - graphQL - probabilmente è più usabile per questo tipo di implementazione in quanto estrae i singoli fields

Creare un c.t. -> 1 content perogni uom non ti permette di modificare in modo semplice gli i18n.

Quindi possiamo creare 1! nodo uom con un jsonb con tutte le uom e tutte le i18n.
Poi aggiungiamo json-editor nel widget in modo da poter editare uom e i vari linguaggi


JSON config from ucum lhc for units of measure
```
["isBase_", (bolean)
  "name_", (string)        -- [1]
  "csCode_", (string)      -- [2]
  "ciCode_", (string)
  "property_", (string)    -- [4]
  "magnitude_", (int)
  ["dim_","dimVec_"],
  "printSymbol_", (string) -- [7]
  "class_", (boolean)
  "isMetric_", (boolean)
  "variable_",
  "cnv_", (boolean)
  "cnvPfx_", (int)
  "isSpecial_", (boolean)
  "isArbitrary_", (boolean)
  "moleExp_", (int)
  "synonyms_", (string)
  "source_", (string)
  "loincProperty_", (string)
  "category_", (string)
  "guidance_", (string)
  "csUnitString_", (boolean)
  "ciUnitString_", (boolean)
  "baseFactorStr_", (boolean)
  "baseFactor_", (boolean)
  "defError_" (boolean)]
```

Json schema for uom using significative elements

```
{
"type": "object",
          "properties": {
            "name_":{"type": "string"},
            "csCode_":{"type": "string"},
            "property_":{"type": "string"},
            "printSymbol_":{"type": "string"}
          }
}          
```

Json schema for units of measure content
```
{"type": "array","format": "table","title": "Units of measure",
 "items": {"type": "object",
           "properties": {
             "printSymbol":{"type": "string"},
             "csCode":{"type": "string"},
             "name":{"type": "array",
               "format": "table",
               "items": {
                        "type": "object",
                        "properties": {
                          "language": {"type": "string",
                                       "$ref": "http://local.d8mapping.it/api/json/i18n"
                            },
                            "label": {"type": "string"}
                         }
                        }
             },
             "phisycal range": {
               "type": "object",
               "properties": {
                  "minimum": {"type": "number"},
                  "maximum": {"type": "number"}
               }
             }

}}}
```

Json schema for Observed properties.
> Observed properties are caracterized by the uom and a label

```
{
  "type": "array",
  "format": "table",
  "title": "Characteristics",
  "uniqueItems": true,
  "items": {"type": "object",
            "properties": {
              "observed property": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/obsp"
              },
              "uom": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/uom",
                  "default": "[pH]"
               },
               "limits": {
                  "type" : "object",
                  "format": "grid-strict",
                  "properties": {
                                "minimum": {"type": "number","options": {
        "grid_columns": 3
      }},
                                "exclusiveMinimum": {"type": "boolean","options": {
        "grid_columns": 3
      }},
                                "maximum": {"type": "number", "options": {
        "grid_columns": 3
      }},                                
                                "exclusiveMaximum": {"type": "boolean","options": {
        "grid_columns": 3
      }}
                              }
             }
   }
}
}

```
Suddividiamo le Observed properties in

- elementi chimici
- composti chimici (CAS Number https://en.wikipedia.org/wiki/CAS_Registry_Number)
- composti organici

La uom associata possiamo ridefinirla come default uom - Dobbiamo dare la possibilità però di associare la uom quando creaimo il Water Stream o la Analysis Specification


Analysis specification è un subset di observed properties

Get the GraphQL
http://local.d8mapping.it/uom?query={units_of_measure(id:279){jsonb}}

Usando GraphQL risulta complicato ottenere il json array delle units_of_measure

Json schema for Analysis Specification con i limiti rispetto alla law

```
{
  "type": "array",
  "format": "table",
  "title": "Analysis",
  "uniqueItems": true,
  "items": {"type": "object",
            "properties": {
                          "observed property": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/obsp"
              },

            "value":{"anyOf": [
                {"type": "number"},
                {"type": "null"}
              ]},
            "value":{"type": ["number","null"]},

            "uom": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/uom"}
            }
   }
}
```

Json for Observed Properties
```
{"type": "array",
 "format": "table",
 "title": "Observed Properties List",
 "items": {"type": "object",
           "properties": {
           "printSymbol":{"type": "string"},
           "code":{"type": "string"},       
           "name": {"type": "array",
                     "format": "table",
                     "items": {
                              "type": "object",
                              "properties": {
                                "language": {"type": "string",
                                  "$ref": "http://local.d8mapping.it/api/json/i18n"
                                },
                                "label": {"type": "string"}
                              }
                    }
           }
  }
}
}
```
Json schema for Analysis values
```
{
  "type": "array",
  "format": "table",
  "title": "Analysis",
  "uniqueItems": true,
  "items": {"type": "object",
            "properties": {
              "observed property": {
                 "type": "string",
                 "$ref": "http://local.d8mapping.it/api/json/obsp"
              },
              "value":{"type": "number"},
              "uom": {
                   "type": "string",
                   "$ref": "http://local.d8mapping.it/api/json/uom"
                   "options": {
                    "dependencies": {
                      "observed property": "foo"
                    }
                  }
              }
            }
   },
  "default": [
    {
      "obsp": "dog",
      "name": "Walter"
    }
  ]
}
```


## CoverageJSON

https://covjson.org/spec/
```
"parameters" : {
    "TEMP": {
      "type" : "Parameter",
      "description" : {
        "en": "The air temperature measured in degrees Celsius."
      },
      "unit" : {
        "label": {
          "en": "Degree Celsius"
        },
        "symbol": {
          "value": "Cel",
          "type": "http://www.opengis.net/def/uom/UCUM/"
        }
      },
      "observedProperty" : {
        "id" : "http://vocab.nerc.ac.uk/standard_name/air_temperature/",
        "label" : {
          "en": "Air temperature",
          "de": "Lufttemperatur"
        }
      }
    }
  }
```  

Qui vengono definiti dei [json schema](http://json-schema.org/) per la WaterQuality
- https://github.com/smart-data-models/dataModel.WaterQuality/blob/master/WaterQualityObserved/schema.json

- https://github.com/gordonfn/wqx

- https://github.com/smart-data-models/dataModel.Environment

  Here is an explanaition https://fiware-datamodels.readthedocs.io/en/latest/Environment/WaterQualityObserved/doc/spec/index.html

The _Analysis specification_ content is used to save a json scheleton of analysis parameter for the selected country.
- set the values limits from laws
- get a scheleton (json) of parameters to prefill the _Water Stream_ content

With the geolocation module we have the 	
Geolocation - Geometry Data - Natural Earth - Countries module shipped with.

This module will install a list of taxonomy terms (Countries) from Natual Earth.
Each term is composed of a country name and the country geometry in json format (field type Geolocation Geometry - Geometry).

`geolocation/modules/geolocation_geometry/modules/geolocation_geometry_natural_earth_countries`

In the `analysis_specification` content type we have a field Country from address module with a list of Countries (without geometries)

We can substitute the actual Country field from address module with the Countries list from the taxonomies shipped with the Geolocation - Geometry Data - Natural Earth - Countries. This is utile to get the normative from a geographical point of view. If the wd or ws is geographically inside a country we can get the country normativa to **verify** the values


# Module functionalities

The module will load the nodes from `analysis_specification` content type.

This content type is used to store the templates of the analysis with all the specifications in a json format.

Actually the json is inserted manually but is possible to imagine to upload a file and convert it to json in order to create contents of this type.

Once the contents of `analysis_specification` the module will alter the form for the `water_offer` content type in order to show a selectbox with options realted to `analysis_specification` contents.

When the `analysis_specification` is selected a table will compare to fill the values.

**TODO** Maybe is better to use a tab elements and foreach tab insert the table for the `analysis_specification` content and implement a search for the Parameter column using javascript and datatables.

When saving the `water_offer` content the data from the table are stored inside a json and saved back to the `water_offer` field `field_analysis_values` of the created node.

# Configuration
We need to export the configurations about
- `analysis_specification` content type
- `water_offer` content type


# Techincal stuff used

1. In `prjo_ucp_analysis.module` use the `hook_form_FORM_ID_alter` to insert a new form field.

2. If we want to add an autocomplete we need to
   Create a route `prjo_ucp_analysis.routing.yml` to get data for the autocomplete.
   Create the Controller `prjo_ucp_analysis/src/Controller/AnalysisAutoCompleteController.php`


- Get nodes of given content type
  https://drupal.stackexchange.com/questions/213689/get-all-nodes-of-given-type

  You want to use entity storage.

  `$storage = \Drupal::service('entity_type.manager')->getStorage('node');`
  There are two main ways to query for entities:

  Using entity storage's getQuery() method
  ```
  $my_entity_ids = $storage->getQuery()
    ->condition('type', 'article')
    ->condition('status', 1)
    ->execute();

  $my_entities = $storage->loadMultiple($my_entity_ids);
  ```
  Using entity_storage's loadByProperties() method
  ```
  $my_entities = $storage->loadByProperties([
    'type' => 'article',
    'status' => 1,
  ]);
  ```
  Either one is perfectly acceptable and just use whichever makes more sense in your situation.

  Or this one that is the same of the first
  ```
  $entities = \Drupal::entityTypeManager()->getStorage('node')
  ->loadByProperties(['type' => 'analysis_specification', 'status' => 1]);
  ```

- Form Table example with tableselect and tabledrag
  https://www.drupal.org/node/1876710
